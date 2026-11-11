import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import {Box, Button, Fab, Paper, Stack} from '@mui/material';
import {useLiveQuery} from 'dexie-react-hooks';
import {useAtom, useAtomValue} from 'jotai';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import NavBar from '~/components/NavBar';
import {useUser} from '~/features/auth/useUser';
import {setLastMode} from '~/features/fieldObservation/appMode';
import {useOrtofotoYears} from '~/features/fieldObservation/backgroundMaps';
import LayerMenu from '~/features/fieldObservation/components/LayerMenu';
import ObservationDialog from '~/features/fieldObservation/components/ObservationDialog';
import ObservationMap from '~/features/fieldObservation/components/ObservationMap';
import OverfoerselMenu from '~/features/fieldObservation/components/OverfoerselMenu';
import ProjectField from '~/features/fieldObservation/components/ProjectField';
import {getFieldObservationDb} from '~/features/fieldObservation/db';
import {useOverfoersel} from '~/features/fieldObservation/overfoersel/useOverfoersel';
import {
  activeGisLayersAtom,
  backgroundMapAtom,
  ortofotoYearAtom,
  selectedProjectAtom,
} from '~/features/fieldObservation/state';
import useBreakpoints from '~/hooks/useBreakpoints';

import type {DialogTarget} from '~/features/fieldObservation/components/ObservationDialog';
import type {ObservationMapApi} from '~/features/fieldObservation/components/ObservationMap';

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
  const background = useAtomValue(backgroundMapAtom);
  const chosenOrtofotoYear = useAtomValue(ortofotoYearAtom);
  // No year chosen means the newest one the ortofoto WMS offers.
  const {data: ortofotoYears} = useOrtofotoYears(background === 'ortofoto');
  const ortofotoYear = chosenOrtofotoYear ?? ortofotoYears?.[0] ?? null;
  const shownObservations = useMemo(
    () =>
      selectedProject === null
        ? observations
        : observations.filter((observation) => observation.project_no === selectedProject),
    [observations, selectedProject]
  );

  const mapApi = useRef<ObservationMapApi | null>(null);
  const [placing, setPlacing] = useState(false);
  const [target, setTarget] = useState<DialogTarget | null>(null);

  const startPlacing = () => {
    mapApi.current?.centerOnUser();
    setPlacing(true);
  };

  const confirmPlacement = () => {
    const api = mapApi.current;
    if (!api) return;
    const center = api.getCenter();
    const fix = api.lastFix();
    // The GPS accuracy only describes the point if the user left it at the GPS position.
    const accuracy =
      fix && center.distanceTo(fix.latlng) <= Math.max(fix.accuracy, 5) ? fix.accuracy : null;
    setPlacing(false);
    setTarget({
      kind: 'new',
      geom: {type: 'Point', coordinates: [center.lng, center.lat]},
      accuracy,
    });
  };

  return (
    <Box sx={{position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column'}}>
      {/* Field's own top bar, so both modes look like the same app. */}
      <NavBar zIndex={1100}>
        <NavBar.Logo />
        {!isMobile && <NavBar.Title title="Feltobservationer" />}
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          <LayerMenu />
          <OverfoerselMenu overfoersel={overfoersel} notPersisted={!persisted} />
          <NavBar.Menu disableProfile={false} />
        </Box>
      </NavBar>

      <Box sx={{position: 'relative', flex: 1, overflow: 'hidden'}}>
        <ObservationMap
          observations={shownObservations}
          types={types}
          gisLayerIds={activeGisLayers}
          background={background}
          ortofotoYear={ortofotoYear}
          onSelect={(id) => !placing && setTarget({kind: 'existing', id})}
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
            onChange={setSelectedProject}
          />
        </Paper>

        {placing && <Crosshair />}

        <Stack
          direction="row"
          spacing={1}
          sx={{position: 'absolute', bottom: 24, right: 16, zIndex: 1000}}
        >
          {placing ? (
            <>
              <Button variant="contained" color="inherit" onClick={() => setPlacing(false)}>
                Annuller
              </Button>
              <Button variant="contained" onClick={confirmPlacement}>
                Bekræft placering
              </Button>
            </>
          ) : isMobile ? (
            <Fab color="primary" aria-label="Ny feltobservation" onClick={startPlacing}>
              <AddLocationAltIcon />
            </Fab>
          ) : (
            <Fab variant="extended" color="primary" onClick={startPlacing}>
              <AddLocationAltIcon sx={{mr: 1}} />
              Ny feltobservation
            </Fab>
          )}
        </Stack>
      </Box>

      {target && (
        <ObservationDialog
          key={target.kind === 'existing' ? target.id : 'new'}
          db={db}
          userId={user_id}
          // Only a projekt the user can edit, or the new feltobservation would be rejected.
          defaultProjectNo={
            projects.some((project) => project.project_no === selectedProject)
              ? selectedProject
              : null
          }
          target={target}
          onCreated={(id) => setTarget({kind: 'existing', id})}
          onClose={() => setTarget(null)}
        />
      )}
    </Box>
  );
};

export default ObservationPage;
