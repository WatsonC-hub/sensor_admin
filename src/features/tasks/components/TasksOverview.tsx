import {Box} from '@mui/material';

import React from 'react';
import WindowManager from '~/components/ui/WindowManager';
import {DragDropProvider} from '@dnd-kit/react';
import TaskMap from '~/pages/admin/opgaver/TaskMap';
import TaskInfo from './TaskInfo';
import {MapOverview} from '~/hooks/query/useNotificationOverview';
import {AppContext} from '~/state/contexts';
import Station from '~/pages/field/station/Station';

import {BoreholeMapData} from '~/types';
import SensorContent from '~/pages/field/overview/components/SensorContent';
import BoreholeContent from '~/pages/field/overview/components/BoreholeContent';
import {useRawTaskStore} from '../store';
import {locationMetadataQueryOptions, metadataQueryOptions} from '~/hooks/query/useMetadata';
import {useQuery} from '@tanstack/react-query';
import {displayStore, useDisplayState} from '~/hooks/ui';
import BoreholeRouter from '~/pages/field/boreholeno/BoreholeRouter';
import useBreakpoints from '~/hooks/useBreakpoints';
import LocationList from './LocationList';
import TaskItiniaries from './TaskItiniaries';
import LocationRouter from '~/features/station/components/LocationRouter';
import Trip from '~/pages/admin/opgaver/Trip';
import {useTaskItinerary} from '../api/useTaskItinerary';
import {useAtomValue} from 'jotai';
import {fullScreenAtom} from '~/state/atoms';
import {useStationPages} from '~/hooks/useQueryStateParameters';

const TasksOverview = () => {
  const [selectedTask, setSelectedTask] = useRawTaskStore((state) => [
    state.selectedTaskId,
    state.setSelectedTask,
  ]);

  const [, setPageToShow] = useStationPages();

  const {
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
  } = useDisplayState((state) => state);

  // const [, setSelectedData] = useState<NotificationMap | BoreholeMapData | null>(null);
  const {data: metadata} = useQuery(metadataQueryOptions(ts_id || undefined));
  const {data: locationData} = useQuery(locationMetadataQueryOptions(loc_id || undefined));
  const {addLocationToTrip} = useTaskItinerary();
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

  const clickCallback = (data: MapOverview | BoreholeMapData | null) => {
    const {loc_id, selectedTask, boreholeno} = displayStore.getState();

    if (data === null && (loc_id !== null || selectedTask !== null || boreholeno !== null)) {
      setLocId(null);
      setSelectedTask(null);
      setBoreholeNo(null);
      setPageToShow(null);
      return;
    }
    if (data === null) return;

    if ('loc_id' in data) {
      // onColumnFiltersChange && onColumnFiltersChange([{id: 'loc_id', value: data.loc_id}]);
      // console.log('data', data);
      setLocId(data.loc_id);
      setSelectedTask(null);
    } else if ('boreholeno' in data) {
      // console.log('boreholeno', data);
      setBoreholeNo(data.boreholeno);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      flexGrow={1}
      overflow="hidden"
      alignItems="stretch"
      position="relative"
    >
      <Box
        sx={{
          height: '100%',
        }}
      >
        <TaskMap key="taskmap" clickCallback={clickCallback} />
      </Box>
      <DragDropProvider
        key={loc_id}
        onDragStart={() => {
          if (!trip_list && !isTouch) setTripList(true);
        }}
        onDragEnd={handleDrop}
      >
        <WindowManager minColumnWidth={400}>
          <WindowManager.Window
            key="triplist"
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
            key="locationlist"
            show={loc_list}
            minSize={1}
            onClose={() => {
              // setSelectedData(null);
              setLocList(false);
            }}
            // fullScreen={isMobile}
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
            height={isMobile ? '100%' : '100%'}
            onClose={() => {
              // setSelectedData(null);
              closeLocation();
              setSelectedTask(null);
            }}
            sx={{
              m: isMobile ? 0.5 : undefined,
            }}
          >
            <AppContext.Provider value={{loc_id: loc_id!}}>
              <SensorContent />
            </AppContext.Provider>
          </WindowManager.Window>

          <WindowManager.Window
            key="itinerary"
            show={itinerary_id !== null}
            minSize={1}
            onClose={() => setItineraryId(null)}
            height="100%"
          >
            <Trip />
          </WindowManager.Window>

          <WindowManager.Window
            key="boreholeinfo"
            show={boreholeno !== null}
            minSize={1}
            onClose={() => {
              // setSelectedData(null);
              setBoreholeNo(null);
            }}
          >
            <AppContext.Provider value={{boreholeno: boreholeno!}}>
              <BoreholeContent />
            </AppContext.Provider>
          </WindowManager.Window>

          <WindowManager.Window
            key="taskinfo"
            show={selectedTask !== null}
            minSize={2}
            onClose={() => setSelectedTask(null)}
          >
            <Box p={1} overflow="auto">
              <TaskInfo />
            </Box>
          </WindowManager.Window>

          <WindowManager.Window
            key="boreholepage"
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
              <BoreholeRouter />
            </AppContext.Provider>
          </WindowManager.Window>

          <WindowManager.Window
            key="station"
            id="station"
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
              <Station />
            </AppContext.Provider>
          </WindowManager.Window>

          <WindowManager.Window
            key="locationstation"
            show={loc_id !== null && locationData?.timeseries.length === 0}
            minSize={2}
            maxSize={4}
            onClose={() => setSelectedTask(null)}
            fullScreen={isMobile || fullScreen}
            height="100%"
          >
            <AppContext.Provider value={{loc_id: loc_id ?? undefined}}>
              <LocationRouter />
            </AppContext.Provider>
          </WindowManager.Window>
        </WindowManager>
      </DragDropProvider>
      {/* </Box> */}
    </Box>
  );
};

export default TasksOverview;
