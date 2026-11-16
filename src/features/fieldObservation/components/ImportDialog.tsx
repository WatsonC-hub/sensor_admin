import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {isAxiosError} from 'axios';
import React, {useRef, useState} from 'react';
import {toast} from 'react-toastify';

import Button from '~/components/Button';
import {useParseImport} from '~/features/fieldObservation/api/useParseImport';
import {useCreateProjectLayer} from '~/features/fieldObservation/api/useProjectLayers';
import {autoMapping, prepareRows} from '~/features/fieldObservation/importMapping';
import {createObservations} from '~/features/fieldObservation/localWrites';
import {allowsGeometry, isScalarField} from '~/features/fieldObservation/typeFields';

import type {FieldObservationDb} from '~/features/fieldObservation/db';
import type {ColumnTarget} from '~/features/fieldObservation/importMapping';
import type {Geometry, ObservationType, Project} from '~/features/fieldObservation/types';

type Props = {
  db: FieldObservationDb;
  projects: Project[];
  types: ObservationType[];
  defaultProjectNo: string | null;
  onImported: (geoms: Geometry[]) => void;
  /** A projektlag was saved: show its projekt and zoom to it. */
  onLayerSaved: (projectNo: string, geoms: Geometry[]) => void;
  onClose: () => void;
};

const DEFAULT_LAYER_COLOR = '#e65100';

const STEPS = ['Fil', 'Projekt og type', 'Kolonner', 'Gennemse'];
const ACCEPT = '.geojson,.json,.zip,.kml,.gpkg';
const KIND_LABELS = {
  text: 'tekst',
  number: 'tal',
  select: 'valg',
  boolean: 'ja/nej',
  date: 'dato',
  group: 'gruppe',
  relation: 'relation',
} as const;

const targetValue = (target: ColumnTarget) =>
  target.kind === 'field' ? `field:${target.key}` : target.kind;

const parseTarget = (value: string): ColumnTarget =>
  value.startsWith('field:')
    ? {kind: 'field', key: value.slice('field:'.length)}
    : {kind: value as 'custom' | 'skip'};

const errorText = (error: unknown) => {
  if (isAxiosError(error)) {
    if (!error.response) return 'Import kræver forbindelse til serveren. Prøv igen.';
    if (error.response.status === 413) return 'Filen er for stor (højst 50 MB).';
    const detail = (error.response.data as {detail?: unknown} | undefined)?.detail;
    if (typeof detail === 'string') return detail;
  }
  return 'Filen kunne ikke læses.';
};

/**
 * Import of a GIS file as feltobservationer of one observationstype. The server reads the
 * file; everything after that happens on the device, and overførsel sends the result.
 */
const ImportDialog = ({
  db,
  projects,
  types,
  defaultProjectNo,
  onImported,
  onLayerSaved,
  onClose,
}: Props) => {
  const parse = useParseImport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createLayer = useCreateProjectLayer();
  // A projektlag is only shown on the map; it has no type, columns or feltobservationer.
  const [asLayer, setAsLayer] = useState(false);
  const [layerName, setLayerName] = useState('');
  const [layerColor, setLayerColor] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [projectNo, setProjectNo] = useState(defaultProjectNo ?? '');
  const [typeId, setTypeId] = useState<number | ''>('');
  const [mapping, setMapping] = useState<Record<string, ColumnTarget>>({});
  const [saving, setSaving] = useState(false);

  const parsed = parse.data;
  const features = parsed?.features.features ?? [];
  const geometryTypes = [...new Set(features.map((feature) => feature.geometry.type))];
  const typeOptions = types.filter((type) =>
    geometryTypes.every((geometryType) => allowsGeometry(type, geometryType))
  );
  const type = types.find((candidate) => candidate.id === typeId);
  const activeFields = (type?.fields ?? []).filter(
    (field) => !field.archived && isScalarField(field)
  );

  const rows = type ? prepareRows(features, type, mapping) : [];
  const valid = rows.filter((row) => row.error === null);
  const invalid = rows.filter((row) => row.error !== null);
  // One line per object and problem; parts of a multi-geometry share their object's number.
  const problems = [
    ...new Map(
      [
        ...invalid.map((row) => ({index: row.index, reason: row.error ?? ''})),
        ...(parsed?.skipped ?? []),
      ].map((problem) => [`${problem.index}:${problem.reason}`, problem])
    ),
  ].sort(([, a], [, b]) => a.index - b.index);

  const readFile = (chosen: File, layer: string | null) => {
    setFile(chosen);
    setTypeId('');
    setLayerName(layer ?? chosen.name.replace(/\.[^.]+$/, ''));
    setLayerColor(null);
    parse.mutate({file: chosen, layer});
  };

  const chooseType = (id: number) => {
    setTypeId(id);
    const chosen = types.find((candidate) => candidate.id === id);
    setMapping(
      autoMapping(
        (parsed?.columns ?? []).map((column) => column.name),
        chosen?.fields ?? []
      )
    );
  };

  const create = async () => {
    if (!type) return;
    setSaving(true);
    try {
      await createObservations(
        db,
        valid.map((row) => ({
          geom: row.geom,
          customFields: row.customFields,
          fields: {
            type_id: type.id,
            project_no: projectNo || null,
            note: null,
            internal_note: null,
            properties: row.properties,
          },
        }))
      );
      toast.success(`${valid.length} feltobservationer oprettet. De overføres som de næste.`);
      onImported(valid.map((row) => row.geom));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // The file's own style (a QGIS style in a GeoPackage), unless the user picks a color.
  const fileStyle = parsed?.style ?? null;
  const shownColor = layerColor ?? fileStyle?.color ?? DEFAULT_LAYER_COLOR;
  const saveLayer = () => {
    if (!projectNo) return;
    const style = layerColor
      ? {...fileStyle, color: layerColor, fillColor: layerColor}
      : {color: DEFAULT_LAYER_COLOR, ...fileStyle};
    createLayer.mutate(
      {
        project_no: projectNo,
        name: layerName.trim(),
        style,
        features: features.map((feature) => ({
          geometry: feature.geometry,
          properties: feature.properties,
        })),
      },
      {
        onSuccess: () => {
          toast.success(`Projektlaget "${layerName.trim()}" er gemt`);
          onLayerSaved(
            projectNo,
            features.map((feature) => feature.geometry)
          );
          onClose();
        },
        onError: (error) => toast.error(errorText(error)),
      }
    );
  };

  const canGoOn =
    (step === 0 && !!parsed && features.length > 0) ||
    (step === 1 && type !== undefined) ||
    step === 2;
  const canSaveLayer = projectNo !== '' && layerName.trim() !== '' && !createLayer.isPending;

  return (
    <Dialog open fullWidth maxWidth="md" onClose={onClose}>
      <DialogTitle>{asLayer ? 'Importér projektlag' : 'Importér feltobservationer'}</DialogTitle>
      <DialogContent dividers>
        <Stepper activeStep={step} sx={{mb: 3}}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {step === 0 && (
          <Stack spacing={2}>
            <Typography variant="body2">
              GeoJSON, KML, GeoPackage eller en zippet Shape-fil. Filen bliver enten
              feltobservationer af én observationstype, eller et projektlag, som kun vises på
              kortet.
            </Typography>
            <Box>
              <input
                ref={fileInputRef}
                hidden
                type="file"
                accept={ACCEPT}
                onChange={(event) => {
                  const chosen = event.target.files?.[0];
                  if (chosen) readFile(chosen, null);
                  event.target.value = '';
                }}
              />
              <Button
                bttype="tertiary"
                startIcon={<UploadFileIcon />}
                onClick={() => fileInputRef.current?.click()}
              >
                Vælg fil
              </Button>
              {file && (
                <Typography component="span" variant="body2" sx={{ml: 2}}>
                  {file.name}
                </Typography>
              )}
            </Box>
            {parse.isPending && <LinearProgress />}
            {parse.isError && <Alert severity="error">{errorText(parse.error)}</Alert>}
            {parsed && parsed.layers.length > 1 && file && (
              <TextField
                select
                label="Lag"
                value={parsed.layer}
                onChange={(event) => readFile(file, event.target.value)}
              >
                {parsed.layers.map((layer) => (
                  <MenuItem key={layer} value={layer}>
                    {layer}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {parsed && !parse.isPending && (
              <Alert severity={features.length > 0 ? 'success' : 'warning'}>
                {features.length} objekter ({geometryTypes.join(', ') || 'ingen geometri'}),{' '}
                {parsed.columns.length} kolonner.
                {parsed.skipped.length > 0 && ` ${parsed.skipped.length} objekter springes over.`}
              </Alert>
            )}
          </Stack>
        )}

        {step === 1 && (
          <Stack spacing={2}>
            <RadioGroup
              row
              value={asLayer ? 'layer' : 'observations'}
              onChange={(event) => setAsLayer(event.target.value === 'layer')}
            >
              <FormControlLabel
                value="observations"
                control={<Radio />}
                label="Feltobservationer"
              />
              <FormControlLabel
                value="layer"
                control={<Radio />}
                label="Projektlag (kun til visning)"
              />
            </RadioGroup>
            <TextField
              select
              label="Projekt"
              value={projectNo}
              onChange={(event) => setProjectNo(event.target.value)}
              helperText={asLayer ? 'Et projektlag hører altid til ét projekt.' : undefined}
            >
              {!asLayer && <MenuItem value="">Intet projekt</MenuItem>}
              {projects.map((project) => (
                <MenuItem key={project.project_no} value={project.project_no}>
                  {project.project_title
                    ? `${project.project_no} – ${project.project_title}`
                    : project.project_no}
                </MenuItem>
              ))}
            </TextField>
            {asLayer && (
              <>
                <TextField
                  label="Navn på laget"
                  value={layerName}
                  onChange={(event) => setLayerName(event.target.value)}
                />
                <Stack direction="row" spacing={2} sx={{alignItems: 'center'}}>
                  <TextField
                    type="color"
                    label="Farve"
                    value={shownColor}
                    onChange={(event) => setLayerColor(event.target.value)}
                    sx={{width: 120}}
                  />
                  <Typography variant="body2" sx={{color: 'text.secondary'}}>
                    {fileStyle && !layerColor
                      ? 'Stilen fra filen (QGIS) bruges.'
                      : 'Farve for linjer og flader.'}
                  </Typography>
                </Stack>
              </>
            )}
            {!asLayer && (
              <TextField
                select
                label="Observationstype"
                value={typeId}
                onChange={(event) => chooseType(Number(event.target.value))}
                helperText="Kun typer, der passer til filens geometrier."
              >
                {typeOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {!asLayer && typeOptions.length === 0 && (
              <Alert severity="warning">
                Ingen observationstype passer til {geometryTypes.join(' og ')}.
              </Alert>
            )}
          </Stack>
        )}

        {step === 2 && parsed && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Kolonne i filen</TableCell>
                <TableCell>Bliver til</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parsed.columns.map((column) => (
                <TableRow key={column.name}>
                  <TableCell>
                    {column.name}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ml: 1, color: 'text.secondary'}}
                    >
                      {KIND_LABELS[column.kind]}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      fullWidth
                      value={targetValue(mapping[column.name] ?? {kind: 'custom'})}
                      onChange={(event) =>
                        setMapping((current) => ({
                          ...current,
                          [column.name]: parseTarget(event.target.value),
                        }))
                      }
                    >
                      {activeFields.map((field) => (
                        <MenuItem key={field.key} value={`field:${field.key}`}>
                          {field.label} ({KIND_LABELS[field.kind]})
                        </MenuItem>
                      ))}
                      <MenuItem value="custom">Ekstra felt</MenuItem>
                      <MenuItem value="skip">Spring over</MenuItem>
                    </TextField>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {step === 3 && parsed && (
          <Stack spacing={2}>
            <Alert severity={invalid.length === 0 ? 'success' : 'warning'}>
              {valid.length} gyldige og {invalid.length} ugyldige
              {parsed.skipped.length > 0 && `, og ${parsed.skipped.length} sprunget over`}. Kun de
              gyldige oprettes.
            </Alert>
            {problems.length > 0 && (
              <Box sx={{maxHeight: 280, overflow: 'auto'}}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Objekt nr.</TableCell>
                      <TableCell>Problem</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {problems.map(([key, problem]) => (
                      <TableRow key={key}>
                        <TableCell>{problem.index + 1}</TableCell>
                        <TableCell>{problem.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button bttype="tertiary" startIcon={<CloseIcon />} onClick={onClose}>
          Annuller
        </Button>
        {step > 0 && (
          <Button bttype="tertiary" startIcon={<ArrowBackIcon />} onClick={() => setStep(step - 1)}>
            Tilbage
          </Button>
        )}
        {step === 1 && asLayer ? (
          <Button
            bttype="primary"
            startIcon={<SaveIcon />}
            disabled={!canSaveLayer}
            onClick={saveLayer}
          >
            Gem projektlag
          </Button>
        ) : step < 3 ? (
          <Button
            bttype="primary"
            endIcon={<ArrowForwardIcon />}
            disabled={!canGoOn}
            onClick={() => setStep(step + 1)}
          >
            Næste
          </Button>
        ) : (
          <Button
            bttype="primary"
            startIcon={<SaveIcon />}
            disabled={valid.length === 0 || saving}
            onClick={() => void create()}
          >
            Opret {valid.length}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog;
