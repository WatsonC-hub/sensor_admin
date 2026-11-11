import {zodResolver} from '@hookform/resolvers/zod';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import {useLiveQuery} from 'dexie-react-hooks';
import React, {useEffect} from 'react';
import {useForm} from 'react-hook-form';

import {createTypedForm} from '~/components/formComponents/Form';
import ObservationPhotos from '~/features/fieldObservation/components/ObservationPhotos';
import {
  createObservation,
  deleteObservation,
  updateObservation,
} from '~/features/fieldObservation/localWrites';
import {observationFormSchema} from '~/features/fieldObservation/schema';
import useBreakpoints from '~/hooks/useBreakpoints';

import type {FieldObservationDb} from '~/features/fieldObservation/db';
import type {ObservationFormInput, ObservationFormOutput} from '~/features/fieldObservation/schema';
import type {Geometry, LocalObservation} from '~/features/fieldObservation/types';

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
  onCreated: (id: string) => void;
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
});

const syncText = (observation: LocalObservation) => {
  if (observation.dirty === -1) return `Afvist af serveren: ${observation.sync_error}`;
  if (observation.dirty === 1) return 'Ikke overført endnu';
  return null;
};

const ObservationDialog = ({db, userId, defaultProjectNo, target, onCreated, onClose}: Props) => {
  const {isMobile} = useBreakpoints();
  const types = useLiveQuery(() => db.types.toArray(), [db], []);
  const projects = useLiveQuery(() => db.projects.toArray(), [db], []);
  const observation = useLiveQuery(
    () => (target.kind === 'existing' ? db.observations.get(target.id) : undefined),
    [db, target]
  );

  const formMethods = useForm<ObservationFormInput, unknown, ObservationFormOutput>({
    resolver: zodResolver(observationFormSchema),
    defaultValues: toFormValues(undefined, defaultProjectNo),
  });
  const {reset} = formMethods;

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

  const handleSave = async (values: ObservationFormOutput) => {
    if (target.kind === 'new') {
      const id = await createObservation(db, target.geom, target.accuracy, values);
      onCreated(id);
    } else {
      await updateObservation(db, target.id, values);
      reset(toFormValues({...observation!, ...values}));
    }
  };

  const handleDelete = async () => {
    if (target.kind !== 'existing') return;
    if (!window.confirm('Slet feltobservationen?')) return;
    await deleteObservation(db, target.id);
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

  const status = observation ? syncText(observation) : null;

  return (
    <Dialog open fullScreen={isMobile} fullWidth maxWidth="sm" onClose={onClose}>
      <DialogTitle sx={{display: 'flex', alignItems: 'center', pr: 1}}>
        <Typography variant="h6" component="span" sx={{flex: 1}}>
          {target.kind === 'new' ? 'Ny feltobservation' : 'Feltobservation'}
        </Typography>
        <IconButton aria-label="Luk" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {types.length === 0 && (
            <Alert severity="warning">
              Observationstyperne er ikke hentet endnu. Det kræver forbindelse første gang.
            </Alert>
          )}
          {!canEdit && observation && (
            <Alert severity="info">Du kan se, men ikke redigere, denne feltobservation.</Alert>
          )}
          {status && (
            <Alert severity={observation?.dirty === -1 ? 'error' : 'info'}>{status}</Alert>
          )}
          <Form formMethods={formMethods} gridSizes={12}>
            <Form.Input
              name="type_id"
              label="Type"
              select
              keyType="number"
              disabled={!canEdit}
              options={types.map((type) => ({[type.id]: type.name}))}
            />
            <Form.Input
              name="project_no"
              label="Projekt"
              select
              disabled={!canEdit}
              options={projectOptions}
            />
            <Form.Input name="note" label="Note" multiline minRows={3} disabled={!canEdit} />
            <Form.Input
              name="internal_note"
              label="Intern note"
              helperText="Vises aldrig for kunder"
              multiline
              minRows={2}
              disabled={!canEdit}
            />
          </Form>
          {target.kind === 'existing' && (
            <>
              <Divider />
              <ObservationPhotos db={db} observationId={target.id} disabled={!canEdit} />
            </>
          )}
          {target.kind === 'new' && (
            <Typography variant="body2" sx={{color: 'text.secondary'}}>
              Du kan tilføje billeder, når feltobservationen er gemt.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {target.kind === 'existing' && canEdit && (
          <Button color="error" startIcon={<DeleteIcon />} onClick={() => void handleDelete()}>
            Slet
          </Button>
        )}
        <Form formMethods={formMethods} useGrid={false}>
          <Form.Submit submit={(values) => void handleSave(values)} disabled={!canEdit} />
        </Form>
      </DialogActions>
    </Dialog>
  );
};

export default ObservationDialog;
