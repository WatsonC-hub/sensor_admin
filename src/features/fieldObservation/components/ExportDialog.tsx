import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import {
  Alert,
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
} from '@mui/material';
import {useAtom, useAtomValue} from 'jotai';
import React, {useState} from 'react';

import Button from '~/components/Button';
import {useExportGeoPackage} from '~/features/fieldObservation/api/useExportGeoPackage';
import {AllCheckbox, Swatch} from '~/features/fieldObservation/components/Legend';
import {exportChoiceAtom, hiddenLegendAtom} from '~/features/fieldObservation/state';
import {geometryKind, resolveStyle, typeKey} from '~/features/fieldObservation/styles';

import type {ExportChoice} from '~/features/fieldObservation/state';
import type {
  LocalObservation,
  ObservationType,
  ProjectLayer,
} from '~/features/fieldObservation/types';

type Props = {
  projectNo: string;
  /** The projekt's feltobservationer on the device. */
  observations: LocalObservation[];
  types: ObservationType[];
  projectLayers: ProjectLayer[];
  onClose: () => void;
};

const toggled = (list: string[], item: string) =>
  list.includes(item) ? list.filter((other) => other !== item) : [...list, item];

/**
 * Hent som GeoPackage: choose which observationstyper and projektlag go in the file, and
 * whether photos do. Grouped like the signaturforklaring. Whole types only; a type's
 * feltgrupper (e.g. geologi) come with it.
 */
const ExportDialog = ({projectNo, observations, types, projectLayers, onClose}: Props) => {
  const exportGeoPackage = useExportGeoPackage();
  const hiddenLegend = useAtomValue(hiddenLegendAtom);
  const [choices, setChoices] = useAtom(exportChoiceAtom);

  const counts = new Map<number, number>();
  for (const observation of observations) {
    if (observation.deleted_at) continue;
    counts.set(observation.type_id, (counts.get(observation.type_id) ?? 0) + 1);
  }
  const projectTypes = types.filter((type) => counts.has(type.id));

  // The last choice for this projekt; the first time, what the legend shows, without projektlag.
  const [choice, setChoice] = useState<ExportChoice>(() => {
    const stored = choices[projectNo];
    if (stored) return stored;
    return {
      types: projectTypes
        .filter((type) => !hiddenLegend.includes(typeKey(type.id)))
        .map((type) => type.schema_key),
      projectLayers: [],
      images: true,
    };
  });
  const chosenTypes = projectTypes.filter((type) => choice.types.includes(type.schema_key));
  const chosenLayers = projectLayers.filter((layer) => choice.projectLayers.includes(layer.id));

  const notSent = observations.filter(
    (observation) =>
      observation.dirty !== 0 && chosenTypes.some((type) => type.id === observation.type_id)
  ).length;

  const download = () => {
    // Only what is in the projekt now; old keys of other types and layers are dropped.
    const sent: ExportChoice = {
      types: chosenTypes.map((type) => type.schema_key),
      projectLayers: chosenLayers.map((layer) => layer.id),
      images: choice.images,
    };
    exportGeoPackage.mutate(
      {projectNo, choice: sent},
      {
        onSuccess: () => {
          setChoices((current) => ({...current, [projectNo]: sent}));
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open fullWidth maxWidth="xs" onClose={onClose}>
      <DialogTitle>Hent som GeoPackage · {projectNo}</DialogTitle>
      <DialogContent dividers sx={{p: 0}}>
        <Typography variant="body2" sx={{px: 2, py: 1.5, color: 'text.secondary'}}>
          En fil til QGIS med projektets feltobservationer fra serveren. Vælg, hvad der skal med.
        </Typography>
        <List dense disablePadding>
          <ListSubheader sx={{lineHeight: '32px', display: 'flex', alignItems: 'center'}}>
            {projectTypes.length > 0 && (
              <AllCheckbox
                shown={chosenTypes.length}
                total={projectTypes.length}
                onChange={(all) =>
                  setChoice({
                    ...choice,
                    types: all ? projectTypes.map((type) => type.schema_key) : [],
                  })
                }
              />
            )}
            Feltobservationer
          </ListSubheader>
          {projectTypes.length === 0 && (
            <Typography variant="body2" sx={{px: 2, py: 1, color: 'text.secondary'}}>
              Ingen feltobservationer i projektet.
            </Typography>
          )}
          {projectTypes.map((type) => {
            const base = resolveStyle(type, {});
            const groups = (type.fields ?? []).filter(
              (field) => field.kind === 'group' && !field.archived
            );
            return (
              <ListItemButton
                key={type.id}
                onClick={() =>
                  setChoice({...choice, types: toggled(choice.types, type.schema_key)})
                }
                sx={{py: 0}}
              >
                <ListItemIcon sx={{minWidth: 32}}>
                  <Checkbox
                    edge="start"
                    size="small"
                    checked={choice.types.includes(type.schema_key)}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <Box sx={{width: 28, display: 'flex', justifyContent: 'center', mr: 1}}>
                  <Swatch
                    kind={geometryKind(type)}
                    color={base.color}
                    icon={base.icon}
                    dashArray={base.dashArray}
                    fillOpacity={base.fillOpacity}
                  />
                </Box>
                <ListItemText
                  primary={type.name}
                  secondary={
                    groups.length > 0
                      ? `Med ${groups.map((field) => field.label).join(', ')}`
                      : undefined
                  }
                />
                <Typography variant="caption" sx={{color: 'text.secondary'}}>
                  {counts.get(type.id)}
                </Typography>
              </ListItemButton>
            );
          })}
          {projectLayers.length > 0 && (
            <>
              <ListSubheader sx={{lineHeight: '32px', display: 'flex', alignItems: 'center'}}>
                <AllCheckbox
                  shown={chosenLayers.length}
                  total={projectLayers.length}
                  onChange={(all) =>
                    setChoice({
                      ...choice,
                      projectLayers: all ? projectLayers.map((layer) => layer.id) : [],
                    })
                  }
                />
                Projektlag
              </ListSubheader>
              {projectLayers.map((layer) => (
                <ListItemButton
                  key={layer.id}
                  onClick={() =>
                    setChoice({...choice, projectLayers: toggled(choice.projectLayers, layer.id)})
                  }
                  sx={{py: 0}}
                >
                  <ListItemIcon sx={{minWidth: 32}}>
                    <Checkbox
                      edge="start"
                      size="small"
                      checked={choice.projectLayers.includes(layer.id)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <Box sx={{width: 28, display: 'flex', justifyContent: 'center', mr: 1}}>
                    <Swatch
                      kind="POLYGON"
                      color={layer.style.color ?? '#e65100'}
                      icon="pin"
                      badge={false}
                      fillOpacity={layer.style.fillOpacity ?? 0.1}
                    />
                  </Box>
                  <ListItemText primary={layer.name} />
                </ListItemButton>
              ))}
            </>
          )}
          <ListSubheader sx={{lineHeight: '32px'}}>Andet</ListSubheader>
          <ListItemButton
            onClick={() => setChoice({...choice, images: !choice.images})}
            sx={{py: 0}}
          >
            <ListItemIcon sx={{minWidth: 32}}>
              <Checkbox
                edge="start"
                size="small"
                checked={choice.images}
                tabIndex={-1}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText
              primary="Billeder"
              secondary="Links til billederne. De første 3 vises, når musen holdes over en feltobservation i QGIS."
            />
          </ListItemButton>
        </List>
        {notSent > 0 && (
          <Alert severity="warning" sx={{m: 2}}>
            {notSent === 1
              ? '1 feltobservation er ikke overført og kommer ikke med i filen.'
              : `${notSent} feltobservationer er ikke overført og kommer ikke med i filen.`}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button bttype="tertiary" startIcon={<CloseIcon />} onClick={onClose}>
          Annuller
        </Button>
        <Button
          bttype="primary"
          startIcon={<DownloadIcon />}
          disabled={
            (chosenTypes.length === 0 && chosenLayers.length === 0) || exportGeoPackage.isPending
          }
          onClick={download}
        >
          {exportGeoPackage.isPending ? 'Henter…' : 'Hent'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
