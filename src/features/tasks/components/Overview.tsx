import {Box} from '@mui/material';

import React, {useCallback} from 'react';
import WindowManager from '~/components/ui/WindowManager';
import {DragDropProvider} from '@dnd-kit/react';
import Map from '~/pages/Map';
import TaskInfo from './TaskInfo';
import {MapOverview} from '~/hooks/query/useNotificationOverview';
import {AppContext} from '~/state/contexts';
import Station from '~/pages/field/station/Station';

import {BoreholeMapData} from '~/types';
import SensorContent from '~/pages/field/overview/components/SensorContent';
import BoreholeContent from '~/pages/field/overview/components/BoreholeContent';
import {metadataQueryOptions} from '~/hooks/query/useMetadata';
import {useQuery} from '@tanstack/react-query';
import {displayStore, useDisplayState} from '~/hooks/ui';
import BoreholeRouter from '~/pages/field/boreholeno/BoreholeRouter';
import useBreakpoints from '~/hooks/useBreakpoints';
import LocationList from './LocationList';
import TaskItiniaries from './TaskItiniaries';
import LocationRouter from '~/features/station/components/LocationRouter';
import Trip from '~/pages/admin/opgaver/Trip';
import useTaskItinerary from '../api/useTaskItinerary';
import {useAtomValue} from 'jotai';
import {fullScreenAtom} from '~/state/atoms';
import {useStationPages} from '~/hooks/useQueryStateParameters';
import LocationHighlighter from '~/features/map/components/LocationHighlighter';
import ItineraryHighlighter from '~/features/map/components/ItineraryHighlighter';
import OwnTaskList from './OwnTaskList';
import {useUser} from '~/features/auth/useUser';

const Overview = () => {
  const [, setPageToShow] = useStationPages();

  const [
    loc_id,
    setLocId,
    ts_id,
    closeLocation,
    boreholeno,
    setBoreholeNo,
    intakeno,
    loc_list,
    setLocList,
    trip_list,
    setTripList,
    itinerary_id,
    setItineraryId,
    selectedTask,
    setSelectedTask,
    showLocationRouter,
    own_task_list,
    setOwnTaskList,
  ] = useDisplayState((state) => [
    state.loc_id,
    state.setLocId,
    state.ts_id,
    state.closeLocation,
    state.boreholeno,
    state.setBoreholeNo,
    state.intakeno,
    state.loc_list,
    state.setLocList,
    state.trip_list,
    state.setTripList,
    state.itinerary_id,
    state.setItineraryId,
    state.selectedTask,
    state.setSelectedTask,
    state.showLocationRouter,
    state.own_task_list,
    state.setOwnTaskList,
  ]);

  // const [, setSelectedData] = useState<NotificationMap | BoreholeMapData | null>(null);
  const {data: metadata} = useQuery(metadataQueryOptions(ts_id || undefined));
  const {addLocationToTrip} = useTaskItinerary();

  const user = useUser();
  const {isMobile, isTouch} = useBreakpoints();
  const fullScreen = useAtomValue(fullScreenAtom);

  const handleDrop = (event: any) => {
    if (event.operation.source === null || event.operation.target === null) return;

    const itinerary_id = event.operation.target.data.itinerary_id;
    const loc_id = event.operation.source.data.loc_id;

    addLocationToTrip.mutate({
      path: `${itinerary_id}`,
      data: {
        loc_id: [loc_id],
      },
    });
  };

  const clickCallback = useCallback(
    (data: MapOverview | BoreholeMapData | null) => {
      const {loc_id, selectedTask, boreholeno} = displayStore.getState();

      if (data === null && (loc_id !== null || selectedTask !== null || boreholeno !== null)) {
        setLocId(null);
        setSelectedTask(null);
        setBoreholeNo(null);
        setPageToShow(null);
        document.querySelectorAll('svg[data-loc-id]').forEach((svg) => {
          svg.classList.remove('selected-marker');
        });
        return;
      }
      if (data === null) return;

      if ('loc_id' in data) {
        setLocId(data.loc_id);
        setSelectedTask(null);
        document.querySelectorAll('svg[data-loc-id]').forEach((svg) => {
          svg.classList.remove('selected-marker');
          if (svg.getAttribute('data-loc-id') === data.loc_id.toString()) {
            svg.classList.add('selected-marker');
          }
        });
      } else if ('boreholeno' in data) {
        setBoreholeNo(data.boreholeno);
      }
    },
    [setBoreholeNo, setLocId, setSelectedTask]
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      flexGrow={1}
      alignItems="stretch"
      position="relative"
    >
      <Box
        sx={{
          height: '100%',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          backgroundColor: 'primary.main',
        }}
      >
        <Map key="taskmap" clickCallback={clickCallback} />
      </Box>
      <DragDropProvider
        onDragStart={() => {
          if (!trip_list && !isTouch) setTripList(true);
        }}
        onDragEnd={handleDrop}
      >
        <WindowManager minColumnWidth={400}>
          <WindowManager.Window
            key="triplist"
            priority={1}
            mobilePriority={1}
            show={trip_list}
            minSize={1}
            onClose={() => {
              // setSelectedData(null);
              setTripList(false);
            }}
            sx={{
              borderBottomLeftRadius: isMobile ? 0 : 3,
            }}
            height={isMobile ? '50%' : '100%'}
          >
            <TaskItiniaries />
          </WindowManager.Window>

          <WindowManager.Window
            key="owntasklist"
            priority={2}
            mobilePriority={2}
            show={own_task_list && user?.simpleTaskPermission === true}
            minSize={1}
            onClose={() => setOwnTaskList(false)}
            sx={{
              borderBottomLeftRadius: isMobile ? 0 : 3,
            }}
            height={isMobile ? '50%' : '100%'}
          >
            <OwnTaskList />
          </WindowManager.Window>

          <WindowManager.Window
            key="locationlist"
            priority={2}
            mobilePriority={2}
            show={loc_list}
            minSize={1}
            onClose={() => setLocList(false)}
            sx={{
              borderBottomLeftRadius: isMobile ? 0 : 3,
            }}
            height={isMobile ? '50%' : '100%'}
          >
            <LocationList />
          </WindowManager.Window>

          <WindowManager.Window
            key="location"
            show={loc_id !== null}
            minSize={1}
            priority={3}
            mobilePriority={3}
            height={'100%'}
            onClose={() => {
              closeLocation();
              setSelectedTask(null);
            }}
            sx={{
              m: isMobile ? 0.5 : undefined,
            }}
          >
            <AppContext.Provider value={{loc_id: loc_id!}}>
              <SensorContent key={loc_id} />
            </AppContext.Provider>
          </WindowManager.Window>

          <WindowManager.Window
            key="boreholeinfo"
            priority={5}
            mobilePriority={5}
            show={boreholeno !== null}
            minSize={1}
            onClose={() => {
              setBoreholeNo(null);
            }}
          >
            <AppContext.Provider value={{boreholeno: boreholeno!}}>
              <BoreholeContent key={boreholeno} />
            </AppContext.Provider>
          </WindowManager.Window>

          <WindowManager.Window
            key="itinerary"
            priority={4}
            mobilePriority={4}
            show={itinerary_id !== null}
            minSize={1}
            onClose={() => setItineraryId(null)}
            height="100%"
          >
            {itinerary_id !== null && <Trip key={itinerary_id} />}
          </WindowManager.Window>

          <WindowManager.Window
            key="taskinfo"
            priority={6}
            mobilePriority={9}
            show={selectedTask !== null}
            minSize={2}
            onClose={() => setSelectedTask(null)}
          >
            <Box key={selectedTask} p={1} overflow="auto">
              <TaskInfo />
            </Box>
          </WindowManager.Window>

          <WindowManager.Window
            key="boreholepage"
            priority={7}
            mobilePriority={6}
            show={boreholeno !== null && intakeno !== null}
            minSize={2}
            maxSize={4}
            fullScreen={isMobile || fullScreen}
            height="100%"
            sx={{
              borderRadius: isMobile ? 0 : 3,
            }}
          >
            <AppContext.Provider value={{boreholeno: boreholeno!, intakeno: intakeno!}}>
              <BoreholeRouter key={`${boreholeno}-${intakeno}`} />
            </AppContext.Provider>
          </WindowManager.Window>

          <WindowManager.Window
            key="station"
            id="station"
            priority={8}
            mobilePriority={7}
            show={ts_id !== null}
            minSize={2}
            maxSize={4}
            fullScreen={isMobile || fullScreen}
            sx={{
              borderRadius: isMobile ? 0 : 3,
            }}
            height="100%"
          >
            <AppContext.Provider value={{loc_id: metadata ? metadata.loc_id : -1, ts_id: ts_id!}}>
              <Station key={ts_id} />
            </AppContext.Provider>
          </WindowManager.Window>

          <WindowManager.Window
            key="locationstation"
            show={showLocationRouter}
            priority={9}
            mobilePriority={8}
            minSize={2}
            maxSize={4}
            onClose={() => setSelectedTask(null)}
            fullScreen={isMobile || fullScreen}
            height="100%"
          >
            <AppContext.Provider value={{loc_id: loc_id ?? undefined}}>
              <LocationRouter key={`location-${loc_id}`} />
            </AppContext.Provider>
          </WindowManager.Window>
        </WindowManager>
      </DragDropProvider>
      <ItineraryHighlighter />
      <LocationHighlighter
        selectedLocId={loc_id ? loc_id : boreholeno ? boreholeno : null}
        color="#1380c4"
      />
    </Box>
  );
};

export default Overview;
