import {Box} from '@mui/material';

import React from 'react';
import WindowManager from '~/components/ui/WindowManager';
import {DragDropProvider} from '@dnd-kit/react';
import {calculateContentHeight} from '~/consts';
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
import {useDisplayState} from '~/hooks/ui';
import BoreholeRouter from '~/pages/field/boreholeno/BoreholeRouter';
import useBreakpoints from '~/hooks/useBreakpoints';
import LocationList from './LocationList';
import TaskItiniaries from './TaskItiniaries';
import LocationRouter from '~/features/station/components/LocationRouter';
import Trip from '~/pages/admin/opgaver/Trip';
import {useTasks} from '../api/useTasks';
import {useTaskStore} from '../api/useTaskStore';

// import {NotificationMap} from '~/hooks/query/useNotificationOverview';
// import {BoreholeMapData} from '~/types';

const TasksOverview = () => {
  const [selectedTask, setSelectedTask] = useRawTaskStore((state) => [
    state.selectedTaskId,
    state.setSelectedTask,
  ]);

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

  const {tasks} = useTaskStore();
  const {moveTask} = useTasks();
  const {isMobile, isTouch} = useBreakpoints();

  const handleDrop = (event: any) => {
    if (event.operation.source === null || event.operation.target === null) return;

    const itinerary_id = event.operation.target.data.itinerary_id;
    const loc_id = event.operation.source.data.loc_id;
    const itinerary_tasks = tasks?.filter((task) => task.itinerary_id === itinerary_id);
    const loc_ids = [...new Set(itinerary_tasks?.map((task) => task.loc_id))];

    const task_ids = tasks?.filter((task) => task.loc_id === loc_id).map((task) => task.id);
    if (task_ids && !loc_ids.includes(loc_id)) {
      moveTask.mutate({
        path: `${itinerary_id}`,
        data: {
          task_ids: task_ids,
          loc_id: [loc_id],
        },
      });
    }
  };

  const clickCallback = (data: MapOverview | BoreholeMapData | null) => {
    if (data === null) {
      setLocId(null);
      setBoreholeNo(null);
      return;
    }

    if ('loc_id' in data) {
      // onColumnFiltersChange && onColumnFiltersChange([{id: 'loc_id', value: data.loc_id}]);
      // console.log('data', data);
      setLocId(data.loc_id);
    } else if ('boreholeno' in data) {
      // console.log('boreholeno', data);
      setBoreholeNo(data.boreholeno);
    }
  };

  return (
    <Box display="flex" flexDirection="column" maxHeight={`calc(100vh-68px)`}>
      <Box
        justifyContent={'center'}
        alignSelf={'center'}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          height: calculateContentHeight(64),
          width: '100%',
          justifySelf: 'center',
          overflow: 'hidden',
          backgroundColor: 'white',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            height: calculateContentHeight(64),
            width: '100%',
            overflow: 'hidden',
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
              height={isMobile ? '50%' : '100%'}
            >
              <LocationList />
            </WindowManager.Window>

            <WindowManager.Window
              key="location"
              show={loc_id !== null}
              minSize={1}
              height={isMobile ? '100%' : 'fit-content'}
              onClose={() => {
                // setSelectedData(null);
                closeLocation();
              }}
              sx={{
                borderRadius: isMobile ? 2.5 : undefined,
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
              <Box p={1}>
                <TaskInfo />
              </Box>
            </WindowManager.Window>

            <WindowManager.Window
              key="boreholepage"
              show={boreholeno !== null && intakeno !== null}
              minSize={2}
              maxSize={4}
              fullScreen={isMobile}
              height="100%"
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
              maxSize={3}
              fullScreen={isMobile}
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
              maxSize={3}
              onClose={() => setSelectedTask(null)}
              height="100%"
            >
              <AppContext.Provider value={{loc_id: loc_id ?? undefined}}>
                <LocationRouter />
              </AppContext.Provider>
            </WindowManager.Window>
          </WindowManager>
        </DragDropProvider>
      </Box>
    </Box>
  );
};

export default TasksOverview;
