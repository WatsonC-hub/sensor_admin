import AddIcon from '@mui/icons-material/Add';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import ExploreIcon from '@mui/icons-material/Explore';
import LocationDisabledIcon from '@mui/icons-material/LocationDisabled';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PentagonOutlinedIcon from '@mui/icons-material/PentagonOutlined';
import PlaceIcon from '@mui/icons-material/Place';
import SaveIcon from '@mui/icons-material/Save';
import TimelineIcon from '@mui/icons-material/Timeline';
import UndoIcon from '@mui/icons-material/Undo';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import {
  Box,
  Fab,
  IconButton,
  Paper,
  SpeedDial,
  SpeedDialAction,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {useIsFetching} from '@tanstack/react-query';
import {useLiveQuery} from 'dexie-react-hooks';
import {useAtom, useAtomValue} from 'jotai';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {toast} from 'react-toastify';

import Button from '~/components/Button';
import NavBar from '~/components/NavBar';
import {useUser} from '~/features/auth/useUser';
import {
  useDeleteProjectLayer,
  useProjectLayers,
} from '~/features/fieldObservation/api/useProjectLayers';
import {useVectorLayers} from '~/features/fieldObservation/api/useVectorLayers';
import {setLastMode} from '~/features/fieldObservation/appMode';
import {useOrtofotoYears} from '~/features/fieldObservation/backgroundMaps';
import {useCompass} from '~/features/fieldObservation/compass';
import ImportDialog from '~/features/fieldObservation/components/ImportDialog';
import LayerPanel, {LayerButton} from '~/features/fieldObservation/components/LayerPanel';
import Legend from '~/features/fieldObservation/components/Legend';
import ObservationDialog from '~/features/fieldObservation/components/ObservationDialog';
import ObservationMap from '~/features/fieldObservation/components/ObservationMap';
import OverfoerselMenu from '~/features/fieldObservation/components/OverfoerselMenu';
import ProjectField from '~/features/fieldObservation/components/ProjectField';
import {getFieldObservationDb} from '~/features/fieldObservation/db';
import {useLocationPermission} from '~/features/fieldObservation/geolocationPermission';
import {updateObservation} from '~/features/fieldObservation/localWrites';
import {useOverfoersel} from '~/features/fieldObservation/overfoersel/useOverfoersel';
import {
  activeGisLayersAtom,
  backgroundMapAtom,
  editModeAtom,
  gisLayerOpacityAtom,
  hiddenLegendAtom,
  hiddenProjectLayersAtom,
  projectLayerOrderAtom,
  sortProjectLayers,
  ortofotoYearAtom,
  selectedProjectAtom,
} from '~/features/fieldObservation/state';
import {hiddenByLegend} from '~/features/fieldObservation/styles';
import {queryKeys} from '~/helpers/queryKeyFactoryHelper';
import useBreakpoints from '~/hooks/useBreakpoints';

import type {DialogTarget} from '~/features/fieldObservation/components/ObservationDialog';
import type {
  Draft,
  DrawShape,
  ObservationMapApi,
} from '~/features/fieldObservation/components/ObservationMap';
import type {Geometry} from '~/features/fieldObservation/types';

/** Ask the browser not to evict unsent data. Returns false if it refused. */
const usePersistentStorage = () => {
  const [persisted, setPersisted] = useState(true);
  useEffect(() => {
    const storage = navigator.storage;
    if (!storage?.persist) return;
    void storage
      .persisted()
      .then((already) => (already ? true : storage.persist()))
      .then(setPersisted)
      .catch(() => setPersisted(false));
  }, []);
  return persisted;
};

/** Warn before leaving the page while there is data that is not overført. */
const useWarnBeforeLeaving = (pending: number) => {
  useEffect(() => {
    if (pending === 0) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Safari and older browsers only show the warning when returnValue is set.
      // oxlint-disable-next-line typescript/no-deprecated
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [pending]);
};

const Crosshair = () => (
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 40,
      height: 40,
      transform: 'translate(-50%, -50%)',
      zIndex: 1000,
      pointerEvents: 'none',
      '&::before, &::after': {
        content: '""',
        position: 'absolute',
        bgcolor: 'error.main',
        boxShadow: '0 0 0 1px white',
      },
      '&::before': {left: '50%', top: 0, bottom: 0, width: 2, ml: '-1px'},
      '&::after': {top: '50%', left: 0, right: 0, height: 2, mt: '-1px'},
    }}
  />
);

const SHAPES: {shape: DrawShape; label: string; icon: React.ReactNode}[] = [
  {shape: 'Point', label: 'Punkt', icon: <PlaceIcon />},
  {shape: 'LineString', label: 'Linje', icon: <TimelineIcon />},
  {shape: 'Polygon', label: 'Flade', icon: <PentagonOutlinedIcon />},
];

const MIN_VERTICES: Record<DrawShape, number> = {Point: 1, LineString: 2, Polygon: 3};

/**
 * What the map is doing:
 * - crosshair: building a geometry under the crosshair (mobile)
 * - drawing: Geoman draws on clicks (desktop)
 * - editing: Geoman edit mode on an existing feltobservation
 */
type Mode =
  | {kind: 'idle'}
  | {kind: 'crosshair'; draft: Draft}
  | {kind: 'drawing'; shape: DrawShape}
  | {kind: 'editing'; id: string};

const draftToGeometry = (draft: Draft): Geometry => {
  const coordinates = draft.vertices.map(([lat, lng]) => [lng, lat]);
  if (draft.shape === 'LineString') return {type: 'LineString', coordinates};
  return {type: 'Polygon', coordinates: [[...coordinates, coordinates[0]]]};
};

const DRAW_HINTS: Record<DrawShape, string> = {
  Point: 'Klik på kortet for at placere punktet.',
  LineString: 'Klik for at tilføje punkter. Klik på det sidste punkt for at afslutte.',
  Polygon: 'Klik for at tilføje hjørner. Klik på det første hjørne for at afslutte.',
};

/**
 * /observation: feltobservationer on their own page (see docs/features/feltobservation.md).
 * Everything here reads and writes the device's database; overførsel runs on the side.
 */
const ObservationPage = () => {
  const {user_id} = useUser();
  const db = useMemo(() => getFieldObservationDb(user_id), [user_id]);
  const overfoersel = useOverfoersel(db);
  const persisted = usePersistentStorage();
  useWarnBeforeLeaving(overfoersel.pending);
  // Opening the page (also from the PWA shortcut) makes it the mode the app reopens in.
  useEffect(() => setLastMode('feltobservationer'), []);

  const {isMobile} = useBreakpoints();
  const observations = useLiveQuery(() => db.observations.toArray(), [db], []);
  const types = useLiveQuery(() => db.types.toArray(), [db], []);
  const projects = useLiveQuery(() => db.projects.toArray(), [db], []);
  const [selectedProject, setSelectedProject] = useAtom(selectedProjectAtom);
  const activeGisLayers = useAtomValue(activeGisLayersAtom);
  const gisLayerOpacity = useAtomValue(gisLayerOpacityAtom);
  const background = useAtomValue(backgroundMapAtom);
  const chosenOrtofotoYear = useAtomValue(ortofotoYearAtom);
  // No year chosen means the newest one the ortofoto WMS offers.
  const {data: ortofotoYears} = useOrtofotoYears(background === 'ortofoto');
  const ortofotoYear = chosenOrtofotoYear ?? ortofotoYears?.[0] ?? null;
  const projectObservations = useMemo(
    () =>
      selectedProject === null
        ? observations
        : observations.filter((observation) => observation.project_no === selectedProject),
    [observations, selectedProject]
  );
  // The legend can hide whole types or one style variant (e.g. "Prøve udtaget").
  const hiddenLegend = useAtomValue(hiddenLegendAtom);
  const shownObservations = useMemo(() => {
    if (hiddenLegend.length === 0) return projectObservations;
    const hidden = new Set(hiddenLegend);
    const typesById = new Map(types.map((type) => [type.id, type]));
    return projectObservations.filter(
      (observation) => !hiddenByLegend(observation, typesById.get(observation.type_id), hidden)
    );
  }, [projectObservations, hiddenLegend, types]);

  const mapApi = useRef<ObservationMapApi | null>(null);
  const [mode, setMode] = useState<Mode>({kind: 'idle'});
  const [target, setTarget] = useState<DialogTarget | null>(null);
  const [dialOpen, setDialOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const compass = useCompass();
  const locationPermission = useLocationPermission();
  const [editMode, setEditMode] = useAtom(editModeAtom);
  // Projektlag belong to the chosen projekt and are only loaded once one is chosen.
  const storedProjectLayers = useProjectLayers(db, selectedProject);
  const projectLayerOrder = useAtomValue(projectLayerOrderAtom);
  // Top layer first, everywhere: the layer menu, the signaturforklaring and the map.
  const projectLayers = useMemo(
    () => sortProjectLayers(storedProjectLayers, projectLayerOrder),
    [storedProjectLayers, projectLayerOrder]
  );
  const hiddenProjectLayers = useAtomValue(hiddenProjectLayersAtom);
  const visibleProjectLayers = useMemo(
    () => projectLayers.filter((layer) => !hiddenProjectLayers.includes(layer.id)),
    [projectLayers, hiddenProjectLayers]
  );
  const deleteProjectLayer = useDeleteProjectLayer(db);
  const projectLayersFetching =
    useIsFetching({queryKey: queryKeys.fieldObservationProjectLayers(selectedProject ?? '')}) > 0;
  // The projekt's extent: its feltobservationer and its shown projektlag. The project_no check
  // drops the previous projekt's layers while the new ones load.
  const projectExtent = useMemo<Geometry[]>(() => {
    if (selectedProject === null) return [];
    return [
      ...projectObservations
        .filter((observation) => !observation.deleted_at)
        .map((observation) => observation.geom),
      ...visibleProjectLayers
        .filter((layer) => layer.project_no === selectedProject)
        .flatMap((layer) => layer.features.features.map((feature) => feature.geometry)),
    ];
  }, [selectedProject, projectObservations, visibleProjectLayers]);
  // SPIKE: GIS layers that are fetched as vector data for the projekt's area and kept offline.
  const vectorLayers = useVectorLayers(db, selectedProject, projectExtent, activeGisLayers);
  // A projekt the user just picked, waiting for its data before the map zooms to it. Only the
  // user's own picks set it, so the projekt restored from the device on load doesn't move the map.
  const pendingZoomRef = useRef<string | null>(null);
  useEffect(() => {
    const pending = pendingZoomRef.current;
    if (pending === null) return;
    if (pending !== selectedProject) {
      pendingZoomRef.current = null;
      return;
    }
    // Wait for the projektlag from the server, and for anything at all to zoom to. Later data
    // changes don't zoom again, because the pending zoom is used up here.
    if (projectLayersFetching || projectExtent.length === 0) return;
    pendingZoomRef.current = null;
    mapApi.current?.fitTo(projectExtent);
  }, [selectedProject, projectExtent, projectLayersFetching]);
  const selectProject = (projectNo: string | null) => {
    if (projectNo !== null && projectNo === selectedProject) {
      mapApi.current?.fitTo(projectExtent);
      return;
    }
    pendingZoomRef.current = projectNo;
    setSelectedProject(projectNo);
  };
  // Only a projekt the user can edit, or new feltobservationer would be rejected.
  const editableSelectedProject = projects.some((project) => project.project_no === selectedProject)
    ? selectedProject
    : null;

  const startCreate = (shape: DrawShape) => {
    setDialOpen(false);
    // A zoom still waiting for data would jump away from where the user is drawing.
    pendingZoomRef.current = null;
    const api = mapApi.current;
    if (!api) return;
    if (isMobile) {
      api.centerOnUser();
      setMode({kind: 'crosshair', draft: {shape, vertices: []}});
      return;
    }
    setMode({kind: 'drawing', shape});
    api.startDraw(shape, (geom) => {
      setMode({kind: 'idle'});
      setTarget({kind: 'new', geom, accuracy: null});
    });
  };

  const confirmPoint = () => {
    const api = mapApi.current;
    if (!api) return;
    const center = api.getCenter();
    const fix = api.lastFix();
    // The GPS accuracy only describes the point if the user left it at the GPS position.
    const accuracy =
      fix && center.distanceTo(fix.latlng) <= Math.max(fix.accuracy, 5) ? fix.accuracy : null;
    setMode({kind: 'idle'});
    setTarget({
      kind: 'new',
      geom: {type: 'Point', coordinates: [center.lng, center.lat]},
      accuracy,
    });
  };

  const changeDraft = (change: (vertices: Draft['vertices']) => Draft['vertices']) =>
    setMode((current) =>
      current.kind === 'crosshair'
        ? {kind: 'crosshair', draft: {...current.draft, vertices: change(current.draft.vertices)}}
        : current
    );

  const addVertex = () => {
    const api = mapApi.current;
    if (!api) return;
    // Snaps to a nearby brønd, so a ledning drawn from it is connected automatically.
    const point = api.snapToPoint(api.getCenter());
    changeDraft((vertices) => [...vertices, [point.lat, point.lng]]);
  };

  const finishDraft = (draft: Draft) => {
    setMode({kind: 'idle'});
    setTarget({kind: 'new', geom: draftToGeometry(draft), accuracy: null});
  };

  const cancel = () => {
    if (mode.kind === 'drawing') mapApi.current?.cancelDraw();
    if (mode.kind === 'editing') {
      mapApi.current?.cancelEdit();
      setTarget({kind: 'existing', id: mode.id});
    }
    setMode({kind: 'idle'});
  };

  const startEditGeometry = (id: string) => {
    setTarget(null);
    if (mapApi.current?.startEdit(id)) {
      setMode({kind: 'editing', id});
    } else {
      toast.error('Feltobservationen er ikke på kortet. Tjek projektfilteret.');
      setTarget({kind: 'existing', id});
    }
  };

  const saveGeometry = async (id: string) => {
    const geom = mapApi.current?.finishEdit();
    setMode({kind: 'idle'});
    if (geom) await updateObservation(db, id, {geom});
    setTarget({kind: 'existing', id});
  };

  const draft = mode.kind === 'crosshair' ? mode.draft : null;
  const hint =
    mode.kind === 'drawing'
      ? DRAW_HINTS[mode.shape]
      : mode.kind === 'editing'
        ? 'Træk i punkterne for at flytte dem.'
        : draft && draft.shape !== 'Point'
          ? `Flyt kortet, så krydset står på næste punkt. ${draft.vertices.length} punkter.`
          : null;

  return (
    <Box sx={{position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column'}}>
      {/* Field's own top bar, so both modes look like the same app. */}
      <NavBar zIndex={1100}>
        <NavBar.Logo />
        {!isMobile && <NavBar.Title title="Feltobservationer" />}
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          {/* Import is preparation work, done on desktop. */}
          {!isMobile && (
            <Tooltip title="Importér fil">
              <IconButton
                color="inherit"
                aria-label="Importér fil"
                disabled={mode.kind !== 'idle'}
                onClick={() => setImporting(true)}
              >
                <UploadFileIcon />
              </IconButton>
            </Tooltip>
          )}
          <LayerButton open={layersOpen} onClick={() => setLayersOpen((open) => !open)} />
          <OverfoerselMenu overfoersel={overfoersel} notPersisted={!persisted} />
          <NavBar.Menu disableProfile={false} />
        </Box>
      </NavBar>

      {/* On desktop the layer panel docks beside the map; on a phone it is full screen. */}
      <Box sx={{flex: 1, display: 'flex', minHeight: 0}}>
        <Box sx={{position: 'relative', flex: 1, overflow: 'hidden'}}>
          <ObservationMap
            observations={shownObservations}
            types={types}
            gisLayerIds={activeGisLayers}
            vectorLayers={vectorLayers}
            gisLayerOpacity={gisLayerOpacity}
            background={background}
            ortofotoYear={ortofotoYear}
            draft={draft}
            projectLayers={visibleProjectLayers}
            heading={compass.heading}
            onSelect={(id) => mode.kind === 'idle' && setTarget({kind: 'existing', id})}
            onReady={(api) => {
              mapApi.current = api;
            }}
          />

          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              right: 8,
              maxWidth: 480,
              mx: 'auto',
              zIndex: 1000,
              display: 'flex',
              p: 0.5,
            }}
          >
            <ProjectField
              projects={projects}
              observations={observations}
              value={selectedProject}
              onChange={selectProject}
            />
          </Paper>

          {mode.kind === 'crosshair' && <Crosshair />}

          {/* Map controls on the left. Compass and GPS only show when permission is missing. */}
          <Stack
            spacing={1}
            sx={{
              position: 'absolute',
              left: 16,
              bottom: 40,
              zIndex: 1000,
              alignItems: 'flex-start',
            }}
          >
            <Legend
              observations={projectObservations}
              types={types}
              projectLayers={projectLayers}
            />
            {projectExtent.length > 0 && (
              <Tooltip title="Zoom til projekt">
                <Fab
                  size="small"
                  aria-label="Zoom til projekt"
                  onClick={() => mapApi.current?.fitTo(projectExtent)}
                >
                  <ZoomOutMapIcon />
                </Fab>
              </Tooltip>
            )}
            {(locationPermission === 'granted' || locationPermission === 'unknown') && (
              <Tooltip title="Zoom til min placering">
                <Fab
                  size="small"
                  aria-label="Zoom til min placering"
                  onClick={() => {
                    const api = mapApi.current;
                    if (!api) return;
                    if (!api.lastFix()) {
                      toast.info('Venter på din placering');
                      return;
                    }
                    api.centerOnUser();
                  }}
                >
                  <MyLocationIcon />
                </Fab>
              </Tooltip>
            )}
            {compass.needsPermission && (
              <Tooltip title="Vis retning (kompas)">
                <Fab size="small" aria-label="Vis retning" onClick={compass.requestPermission}>
                  <ExploreIcon />
                </Fab>
              </Tooltip>
            )}
            {(locationPermission === 'prompt' || locationPermission === 'denied') && (
              <Tooltip title="Vis min placering">
                <Fab
                  size="small"
                  aria-label="Vis min placering"
                  onClick={() => {
                    if (locationPermission === 'denied') {
                      toast.info(
                        'Placering er blokeret for siden. Giv adgang i browserens indstillinger.'
                      );
                    }
                    mapApi.current?.relocate();
                  }}
                >
                  <LocationDisabledIcon />
                </Fab>
              </Tooltip>
            )}
            {mode.kind === 'idle' && (
              <Tooltip
                title={
                  editMode ? 'Redigeringstilstand er slået til' : 'Slå redigeringstilstand til'
                }
              >
                <Fab
                  size="small"
                  color={editMode ? 'primary' : 'default'}
                  aria-label="Redigeringstilstand"
                  aria-pressed={editMode}
                  onClick={() => setEditMode(!editMode)}
                >
                  <EditIcon />
                </Fab>
              </Tooltip>
            )}
          </Stack>

          {hint && (
            <Paper
              elevation={3}
              sx={{
                position: 'absolute',
                bottom: isMobile ? 132 : 88,
                left: 8,
                right: 8,
                maxWidth: 480,
                mx: 'auto',
                zIndex: 1000,
                px: 2,
                py: 1,
              }}
            >
              <Typography variant="body2">{hint}</Typography>
            </Paper>
          )}

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{
              position: 'absolute',
              bottom: 24,
              right: 16,
              left: isMobile ? 16 : 'auto',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
              zIndex: 1000,
            }}
          >
            {mode.kind === 'crosshair' && mode.draft.shape === 'Point' && (
              <>
                <Button bttype="tertiary" startIcon={<CloseIcon />} onClick={cancel}>
                  Annuller
                </Button>
                <Button bttype="primary" startIcon={<CheckIcon />} onClick={confirmPoint}>
                  Bekræft placering
                </Button>
              </>
            )}
            {mode.kind === 'crosshair' && mode.draft.shape !== 'Point' && (
              <>
                <Button bttype="tertiary" startIcon={<CloseIcon />} onClick={cancel}>
                  Annuller
                </Button>
                <Button
                  bttype="tertiary"
                  startIcon={<UndoIcon />}
                  disabled={mode.draft.vertices.length === 0}
                  onClick={() => changeDraft((vertices) => vertices.slice(0, -1))}
                >
                  Fortryd
                </Button>
                <Button bttype="tertiary" startIcon={<AddIcon />} onClick={addVertex}>
                  Tilføj punkt
                </Button>
                <Button
                  bttype="primary"
                  startIcon={<CheckIcon />}
                  disabled={mode.draft.vertices.length < MIN_VERTICES[mode.draft.shape]}
                  onClick={() => finishDraft(mode.draft)}
                >
                  Færdig
                </Button>
              </>
            )}
            {mode.kind === 'drawing' && (
              <Button bttype="tertiary" startIcon={<CloseIcon />} onClick={cancel}>
                Annuller
              </Button>
            )}
            {mode.kind === 'editing' && (
              <>
                <Button bttype="tertiary" startIcon={<CloseIcon />} onClick={cancel}>
                  Annuller
                </Button>
                <Button
                  bttype="primary"
                  startIcon={<SaveIcon />}
                  onClick={() => void saveGeometry(mode.id)}
                >
                  Gem geometri
                </Button>
              </>
            )}
          </Stack>

          {/* Styled like Justér's speed dial (src/components/CustomSpeedDial.tsx). */}
          {mode.kind === 'idle' && (
            <SpeedDial
              ariaLabel="Ny feltobservation"
              direction="up"
              open={dialOpen}
              icon={
                <Box sx={{display: 'flex', alignItems: 'center', px: isMobile ? 0 : 2}}>
                  <AddLocationAltIcon />
                  {!isMobile && (
                    <Typography sx={{pl: 1, textTransform: 'none'}}>Ny feltobservation</Typography>
                  )}
                </Box>
              }
              sx={{
                position: 'absolute',
                bottom: 24,
                right: 16,
                zIndex: 1000,
                alignItems: 'end',
              }}
              FabProps={{
                onClick: () => setDialOpen((open) => !open),
                sx: {
                  width: isMobile ? undefined : 'fit-content',
                  borderRadius: isMobile ? undefined : 4.5,
                  backgroundColor: 'secondary.main',
                  ':hover': {backgroundColor: 'secondary.dark'},
                },
              }}
            >
              {SHAPES.map(({shape, label, icon}) => (
                <SpeedDialAction
                  key={shape}
                  icon={icon}
                  slotProps={{
                    fab: {
                      onClick: () => startCreate(shape),
                      sx: {
                        color: 'white',
                        backgroundColor: 'primary.main',
                        borderRadius: 4,
                        ':hover': {backgroundColor: 'secondary.main'},
                      },
                    },
                    tooltip: {title: label, open: true},
                    staticTooltipLabel: {sx: {borderRadius: 2.5}},
                  }}
                />
              ))}
            </SpeedDial>
          )}
        </Box>
        {layersOpen && (
          <LayerPanel
            getMapView={() => mapApi.current?.getView() ?? null}
            projectNo={selectedProject}
            projectLayers={projectLayers}
            canDelete={editableSelectedProject !== null}
            onDelete={(layer) => {
              if (window.confirm(`Slet projektlaget "${layer.name}" for alle i projektet?`)) {
                deleteProjectLayer.mutate(layer.id, {
                  onError: () => toast.error('Projektlaget kunne ikke slettes. Er du online?'),
                });
              }
            }}
            onClose={() => setLayersOpen(false)}
          />
        )}
      </Box>

      {target && (
        <ObservationDialog
          key={target.kind === 'existing' ? target.id : 'new'}
          db={db}
          userId={user_id}
          defaultProjectNo={editableSelectedProject}
          target={target}
          startInEdit={editMode}
          onEditGeometry={startEditGeometry}
          onOpenObservation={(id) => setTarget({kind: 'existing', id})}
          selectedProjectNo={selectedProject}
          onMovedToProject={(projectNo) =>
            toast.success(
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <span>Flyttet til {projectNo}</span>
                <Button bttype="link" size="small" onClick={() => selectProject(projectNo)}>
                  Vis projekt
                </Button>
              </Box>
            )
          }
          onClose={() => setTarget(null)}
        />
      )}

      {importing && (
        <ImportDialog
          db={db}
          projects={projects}
          types={types}
          defaultProjectNo={editableSelectedProject}
          onImported={(geoms) => mapApi.current?.fitTo(geoms)}
          onLayerSaved={(projectNo, geoms) => {
            setSelectedProject(projectNo);
            mapApi.current?.fitTo(geoms);
          }}
          onClose={() => setImporting(false)}
        />
      )}
    </Box>
  );
};

export default ObservationPage;
