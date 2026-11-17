import {zodResolver} from '@hookform/resolvers/zod';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import EditIcon from '@mui/icons-material/Edit';
import EditLocationAltIcon from '@mui/icons-material/EditLocationAlt';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import {useLiveQuery} from 'dexie-react-hooks';
import React, {useEffect, useRef, useState} from 'react';
import {useForm, useWatch} from 'react-hook-form';

import Button from '~/components/Button';
import {createTypedForm} from '~/components/formComponents/Form';
import FormInput from '~/components/FormInput';
import MoveProjectDialog from '~/features/fieldObservation/components/MoveProjectDialog';
import ObservationPhotos from '~/features/fieldObservation/components/ObservationPhotos';
import ObservationView from '~/features/fieldObservation/components/ObservationView';
import TypeFieldInputs from '~/features/fieldObservation/components/TypeFieldInputs';
import {compactInput, fieldRowSx} from '~/features/fieldObservation/formLayout';
import {directionText} from '~/features/fieldObservation/geo';
import {
  addImage,
  createObservation,
  deleteObservation,
  updateObservation,
} from '~/features/fieldObservation/localWrites';
import {
  directionFromRelation,
  linkedTo,
  relationCandidates,
  touchingRelations,
} from '~/features/fieldObservation/relations';
import {observationFormSchema} from '~/features/fieldObservation/schema';
import {allowsGeometry, propertiesSchema} from '~/features/fieldObservation/typeFields';
import useBreakpoints from '~/hooks/useBreakpoints';

import type {Resolver} from 'react-hook-form';
import type {StagedPhoto} from '~/features/fieldObservation/components/ObservationPhotos';
import type {FieldObservationDb} from '~/features/fieldObservation/db';
import type {ObservationFormInput, ObservationFormOutput} from '~/features/fieldObservation/schema';
import type {Geometry, LocalObservation, TypeField} from '~/features/fieldObservation/types';

const Form = createTypedForm<ObservationFormInput, ObservationFormOutput>();

/** Either a new feltobservation at a position, or an existing one by id. */
export type DialogTarget =
  | {kind: 'new'; geom: Geometry; accuracy: number | null}
  | {kind: 'existing'; id: string};

type Props = {
  db: FieldObservationDb;
  userId: string;
  /** The projekt chosen in the top bar, used for new feltobservationer. */
  defaultProjectNo: string | null;
  target: DialogTarget;
  /** Redigeringstilstand: open existing feltobservationer in Rediger instead of Vis. */
  startInEdit: boolean;
  /** Close the dialog and move the feltobservation's points on the map. */
  onEditGeometry: (id: string) => void;
  /** Open another feltobservation (e.g. one of a brønd's ledninger). */
  onOpenObservation: (id: string) => void;
  /** The projekt chosen on the map (also one the user can't edit), or null for all. */
  selectedProjectNo: string | null;
  /** The feltobservation was moved to another projekt. */
  onMovedToProject: (projectNo: string) => void;
  onClose: () => void;
};

const toFormValues = (
  observation?: LocalObservation,
  defaultProjectNo?: string | null
): ObservationFormInput => ({
  type_id: observation?.type_id as number,
  project_no: (observation ? observation.project_no : defaultProjectNo) ?? '',
  note: observation?.note ?? '',
  internal_note: observation?.internal_note ?? '',
  properties: observation?.properties ?? {},
});

/**
 * One feltobservation, in Vis (compact, read-only) or Rediger (the form). A new one is always
 * in Rediger. Gem saves everything, photos included, and closes the window.
 */
const ObservationDialog = ({
  db,
  userId,
  defaultProjectNo,
  target,
  startInEdit,
  onEditGeometry,
  onOpenObservation,
  selectedProjectNo,
  onMovedToProject,
  onClose,
}: Props) => {
  const [moveMenu, setMoveMenu] = useState<HTMLElement | null>(null);
  const [movingProject, setMovingProject] = useState(false);
  const {isMobile} = useBreakpoints();
  const types = useLiveQuery(() => db.types.toArray(), [db], []);
  const projects = useLiveQuery(() => db.projects.toArray(), [db], []);
  // For relations: what a relation field can point to, and what points to this one.
  const observations = useLiveQuery(() => db.observations.toArray(), [db], []);
  const observation = useLiveQuery(
    () => (target.kind === 'existing' ? db.observations.get(target.id) : undefined),
    [db, target]
  );
  const [editing, setEditing] = useState(target.kind === 'new' || startInEdit);
  const [staged, setStaged] = useState<StagedPhoto[]>([]);
  const [saving, setSaving] = useState(false);

  // Photos picked but never saved are thrown away with the window.
  const stagedRef = useRef(staged);
  stagedRef.current = staged;
  useEffect(() => () => stagedRef.current.forEach((photo) => URL.revokeObjectURL(photo.url)), []);

  // The typefelter depend on the chosen type, so the schema is built at each validation.
  const fieldsRef = useRef<TypeField[]>([]);
  const resolver: Resolver<ObservationFormInput, unknown, ObservationFormOutput> = (
    values,
    context,
    options
  ) =>
    zodResolver(observationFormSchema.extend({properties: propertiesSchema(fieldsRef.current)}))(
      values,
      context,
      options
    );

  const formMethods = useForm<ObservationFormInput, unknown, ObservationFormOutput>({
    resolver,
    defaultValues: toFormValues(undefined, defaultProjectNo),
  });
  const {reset, control, getValues, setValue, formState} = formMethods;
  const typeId = useWatch({control, name: 'type_id'});
  const properties = useWatch({control, name: 'properties'});
  const fields = types.find((type) => type.id === typeId)?.fields ?? [];
  fieldsRef.current = fields;
  // Only types that allow this geometry (and the current type, so it never looks empty).
  const geometryType = target.kind === 'new' ? target.geom.type : observation?.geom.type;
  const typeOptions = types.filter(
    (type) =>
      !geometryType || allowsGeometry(type, geometryType) || type.id === observation?.type_id
  );

  const geom = target.kind === 'new' ? target.geom : observation?.geom;
  const selfId = target.kind === 'existing' ? target.id : null;

  // A new line whose end touches a brønd (snapped while drawing) is connected to it at once.
  // Runs when the type is chosen, and again when the device's feltobservationer have loaded.
  const observationCount = observations.length;
  useEffect(() => {
    if (target.kind !== 'new') return;
    const touching = touchingRelations(fields, target.geom, observations, types);
    for (const [key, id] of Object.entries(touching)) {
      if (!getValues(`properties.${key}`)) setValue(`properties.${key}`, id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeId, observationCount]);

  const direction = geom
    ? directionFromRelation(geom, properties ?? {}, fields, observations)
    : null;
  const linked = observation ? linkedTo(observation, observations, types) : [];

  // Load the stored values once the row is read; later live updates don't overwrite typing.
  const loadedId = observation?.id;
  useEffect(() => {
    if (observation) reset(toFormValues(observation));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedId, reset]);

  const canEdit =
    target.kind === 'new' ||
    (observation !== undefined &&
      (observation.project_no === null
        ? observation.created_by === null || observation.created_by === userId
        : projects.some((project) => project.project_no === observation.project_no)));

  const hasChanges = formState.isDirty || staged.length > 0;

  const discardChanges = () => {
    staged.forEach((photo) => URL.revokeObjectURL(photo.url));
    setStaged([]);
    if (observation) reset(toFormValues(observation));
  };

  const showVis = () => {
    if (hasChanges && !window.confirm('Kassér dine ændringer?')) return;
    discardChanges();
    setEditing(false);
  };

  const handleSave = async (values: ObservationFormOutput) => {
    setSaving(true);
    try {
      const id =
        target.kind === 'new'
          ? await createObservation(db, target.geom, target.accuracy, values)
          : target.id;
      if (target.kind === 'existing') await updateObservation(db, id, values);
      for (const photo of staged) {
        // oxlint-disable-next-line no-await-in-loop
        await addImage(db, id, photo, photo.note.trim() || null);
      }
      // The user is most likely done here: back to the map.
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (target.kind !== 'existing') return;
    if (!window.confirm('Slet feltobservationen?')) return;
    await deleteObservation(db, target.id);
    onClose();
  };

  const handleClose = () => {
    if (editing && hasChanges && !window.confirm('Luk uden at gemme?')) return;
    onClose();
  };

  const projectOptions = [
    {'': 'Intet projekt'},
    ...projects.map((project) => ({
      [project.project_no]: project.project_title
        ? `${project.project_no} – ${project.project_title}`
        : project.project_no,
    })),
  ];
  // Keep a projekt the user can't edit visible, so the field doesn't look empty.
  if (observation?.project_no && !projects.some((p) => p.project_no === observation.project_no)) {
    projectOptions.push({[observation.project_no]: observation.project_no});
  }

  // The row is read from the device asynchronously. Render nothing until it is there, or the
  // form (with empty defaults) flashes before Vis.
  if (target.kind === 'existing' && observation === undefined) return null;

  const showView = !editing && observation !== undefined;

  return (
    <Dialog
      open
      // Vis is a compact sheet over the map; Rediger takes the whole screen on mobile.
      fullScreen={isMobile && editing}
      fullWidth
      maxWidth="sm"
      onClose={handleClose}
      sx={isMobile && !editing ? {'& .MuiDialog-container': {alignItems: 'flex-end'}} : undefined}
      slotProps={
        isMobile && !editing
          ? {paper: {sx: {m: 0, width: '100%', maxHeight: '60vh', borderRadius: '12px 12px 0 0'}}}
          : undefined
      }
    >
      <DialogTitle
        sx={{display: 'flex', alignItems: 'center', pl: isMobile ? 1.5 : 3, pr: 1, py: 0.5}}
      >
        <Typography variant={isMobile ? 'subtitle1' : 'h6'} component="span" sx={{flex: 1}}>
          {target.kind === 'new' ? 'Ny feltobservation' : 'Feltobservation'}
          {/* Where a new one lands, without a field to read or fill in. */}
          {target.kind === 'new' && defaultProjectNo && (
            <Typography component="span" variant="body2" sx={{ml: 1, color: 'text.secondary'}}>
              · {defaultProjectNo}
            </Typography>
          )}
        </Typography>
        <IconButton aria-label="Luk" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={isMobile ? {px: 1.5, py: 1} : undefined}>
        {showView ? (
          <ObservationView
            db={db}
            observation={observation}
            types={types}
            projects={projects}
            observations={observations}
            onOpenObservation={onOpenObservation}
            selectedProjectNo={selectedProjectNo}
          />
        ) : (
          <Stack spacing={1}>
            {types.length === 0 && (
              <Alert severity="warning">
                Observationstyperne er ikke hentet endnu. Det kræver forbindelse første gang.
              </Alert>
            )}
            {!canEdit && observation && (
              <Alert severity="info">Du kan se, men ikke redigere, denne feltobservation.</Alert>
            )}
            {observation?.dirty === -1 && (
              <Alert severity="error">Afvist af serveren: {observation.sync_error}</Alert>
            )}
            <ObservationPhotos
              db={db}
              observationId={selfId}
              disabled={!canEdit}
              staged={staged}
              onStagedChange={setStaged}
            />
            {/* One wrapping layout (no grid), so short fields can share a line on a phone. */}
            <Form formMethods={formMethods} useGrid={false}>
              <Stack spacing={1.5} sx={{pt: 1}}>
                <Box sx={fieldRowSx}>
                  <Box sx={{flex: '1 1 140px', minWidth: 0}}>
                    <FormInput<ObservationFormInput>
                      name="type_id"
                      label="Type"
                      {...compactInput()}
                      select
                      keyType="number"
                      disabled={!canEdit}
                      options={typeOptions.map((type) => ({[type.id]: type.name}))}
                    />
                  </Box>
                  {/* Only when no projekt (that the user can edit) is chosen on the map; moving
                      an existing one is in the Flyt menu. */}
                  {target.kind === 'new' && defaultProjectNo === null && (
                    <Box sx={{flex: '1 1 140px', minWidth: 0}}>
                      <FormInput<ObservationFormInput>
                        name="project_no"
                        label="Projekt"
                        {...compactInput()}
                        select
                        disabled={!canEdit}
                        options={projectOptions}
                        helperText="Uden projekt kan kun du se den"
                      />
                    </Box>
                  )}
                </Box>
                <FormInput<ObservationFormInput>
                  name="note"
                  label="Note"
                  {...compactInput()}
                  multiline
                  disabled={!canEdit}
                />
                <TypeFieldInputs
                  fields={fields}
                  stored={observation?.properties ?? {}}
                  disabled={!canEdit}
                  relationCandidates={(field) =>
                    relationCandidates(field, geom, selfId, observations, types)
                  }
                />
                {/* Intern note always last: it is the least used field. */}
                <FormInput<ObservationFormInput>
                  name="internal_note"
                  label="Intern note (vises aldrig for kunder)"
                  {...compactInput()}
                  multiline
                  disabled={!canEdit}
                />
              </Stack>
            </Form>
            {direction?.direction !== null && direction?.direction !== undefined && (
              <Typography variant="body2">
                Retning: {directionText(direction.direction)}
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ml: 1, color: 'text.secondary'}}
                >
                  {direction.fromRelation ? 'fra brønden og ud' : 'fra første til sidste punkt'}
                </Typography>
              </Typography>
            )}
            {linked.length > 0 && (
              <div>
                <Typography variant="subtitle2">Tilsluttet ({linked.length})</Typography>
                <List dense disablePadding>
                  {linked.map((link) => (
                    <ListItemButton
                      key={link.observation.id}
                      onClick={() => onOpenObservation(link.observation.id)}
                    >
                      <ListItemText
                        primary={`${link.typeName}${link.observation.note ? ` – ${link.observation.note}` : ''}`}
                        secondary={
                          link.direction !== null
                            ? `Retning: ${directionText(link.direction)}`
                            : null
                        }
                      />
                    </ListItemButton>
                  ))}
                </List>
              </div>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{flexWrap: 'wrap', gap: 1, px: isMobile ? 1 : 2, py: isMobile ? 0.5 : 1}}>
        {showView ? (
          <>
            <Box sx={{flex: 1}} />
            <Button bttype="tertiary" startIcon={<CloseIcon />} onClick={onClose}>
              Luk
            </Button>
            {canEdit && (
              <Button bttype="primary" startIcon={<EditIcon />} onClick={() => setEditing(true)}>
                Rediger
              </Button>
            )}
          </>
        ) : (
          <>
            {target.kind === 'existing' && canEdit && (
              <>
                {/* Icons only on a phone, so all actions fit on one line. */}
                {isMobile ? (
                  <>
                    <IconButton aria-label="Slet" color="error" onClick={() => void handleDelete()}>
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      aria-label="Flyt"
                      onClick={(event) => setMoveMenu(event.currentTarget)}
                    >
                      <EditLocationAltIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Button
                      bttype="danger"
                      startIcon={<DeleteIcon />}
                      onClick={() => void handleDelete()}
                    >
                      Slet
                    </Button>
                    <Button
                      bttype="tertiary"
                      startIcon={<EditLocationAltIcon />}
                      endIcon={<ArrowDropDownIcon />}
                      onClick={(event) => setMoveMenu(event.currentTarget)}
                    >
                      Flyt
                    </Button>
                  </>
                )}
                <Menu
                  anchorEl={moveMenu}
                  open={moveMenu !== null}
                  onClose={() => setMoveMenu(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setMoveMenu(null);
                      onEditGeometry(target.id);
                    }}
                  >
                    <ListItemIcon>
                      <EditLocationAltIcon fontSize="small" />
                    </ListItemIcon>
                    Flyt på kortet
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setMoveMenu(null);
                      if (hasChanges && !window.confirm('Kassér dine ændringer?')) return;
                      setMovingProject(true);
                    }}
                  >
                    <ListItemIcon>
                      <DriveFileMoveIcon fontSize="small" />
                    </ListItemIcon>
                    Flyt til andet projekt
                  </MenuItem>
                </Menu>
                {movingProject && (
                  <MoveProjectDialog
                    currentProjectNo={observation?.project_no ?? null}
                    projects={projects}
                    onClose={() => setMovingProject(false)}
                    onMove={(projectNo) => {
                      void updateObservation(db, target.id, {project_no: projectNo}).then(() => {
                        onMovedToProject(projectNo);
                        onClose();
                      });
                    }}
                  />
                )}
              </>
            )}
            <Box sx={{flex: 1}} />
            {/* Rediger and Vis switch with the same button; going to Vis drops changes. */}
            {target.kind === 'existing' ? (
              <Button bttype="tertiary" startIcon={<VisibilityIcon />} onClick={showVis}>
                Vis
              </Button>
            ) : (
              <Button bttype="tertiary" startIcon={<CloseIcon />} onClick={handleClose}>
                Annuller
              </Button>
            )}
            {/* Not Form.Submit: it needs a changed form, and photos alone are a change too. */}
            <Button
              bttype="primary"
              startIcon={<SaveIcon />}
              disabled={!canEdit || saving || (target.kind === 'existing' && !hasChanges)}
              onClick={() => void formMethods.handleSubmit(handleSave)()}
            >
              Gem
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ObservationDialog;
