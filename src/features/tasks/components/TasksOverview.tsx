import {Box} from '@mui/material';

import React from 'react';
import WindowManager from '~/components/ui/WindowManager';

import {calculateContentHeight} from '~/consts';
import TaskMap from '~/pages/admin/opgaver/TaskMap';
import TaskInfo from './TaskInfo';
import {NotificationMap} from '~/hooks/query/useNotificationOverview';
import {AppContext} from '~/state/contexts';
import Station from '~/pages/field/station/Station';

import {BoreholeMapData} from '~/types';
import SensorContent from '~/pages/field/overview/components/SensorContent';
import BoreholeContent from '~/pages/field/overview/components/BoreholeContent';
import {useRawTaskStore} from '../store';
import {metadataQueryOptions} from '~/hooks/query/useMetadata';
import {useQuery} from '@tanstack/react-query';
import {
  useDisplayBoreholeInfo,
  useDisplayBoreholePage,
  useDisplayLocationInfo,
  useDisplayStation,
} from '~/hooks/ui';
import BoreholeRouter from '~/pages/field/boreholeno/BoreholeRouter';
import {useAtomValue} from 'jotai';
import {fullScreenAtom} from '~/state/atoms';

// import {NotificationMap} from '~/hooks/query/useNotificationOverview';
// import {BoreholeMapData} from '~/types';

const TasksOverview = () => {
  const [selectedTask, setSelectedTask] = useRawTaskStore((state) => [
    state.selectedTaskId,
    state.setSelectedTask,
  ]);
  const {loc_id, setLocId, closeLocation} = useDisplayLocationInfo();
  const {ts_id} = useDisplayStation();
  const {boreholeno, setBoreholeNo} = useDisplayBoreholeInfo();
  const {intakeno, setIntakeNo} = useDisplayBoreholePage();
  // const [, setSelectedData] = useState<NotificationMap | BoreholeMapData | null>(null);
  const {data: metadata} = useQuery(metadataQueryOptions(ts_id || undefined));
  const fullScreen = useAtomValue(fullScreenAtom);

  const clickCallback = (data: NotificationMap | BoreholeMapData) => {
    if ('loc_id' in data) {
      // onColumnFiltersChange && onColumnFiltersChange([{id: 'loc_id', value: data.loc_id}]);
      setLocId(data.loc_id);
    } else if ('boreholeno' in data) {
      setBoreholeNo(data.boreholeno);
    }
    // setSelectedData(data);
  };

  return (
    <Box display="flex" flexDirection="column" minHeight={`calc(100vh-68px)`}>
      <Box
        justifyContent={'center'}
        alignSelf={'center'}
        // p={1}
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

        <WindowManager minColumnWidth={400}>
          <WindowManager.Window
            key="location"
            show={loc_id !== null}
            minSize={1}
            onClose={() => {
              // setSelectedData(null);
              closeLocation();
            }}
          >
            <AppContext.Provider value={{loc_id: loc_id!}}>
              <Box p={1}>
                <SensorContent />
              </Box>
            </AppContext.Provider>
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

          {/* <WindowManager.Window
            key="locationstation"
            show={loc_id !== null && ts_id === null}
            size={3}
            onClose={() => setSelectedTask(null)}
          >
            <AppContext.Provider value={{loc_id}}>
              <LocationRouter />
            </AppContext.Provider>
          </WindowManager.Window> */}
          <WindowManager.Window
            key="boreholepage"
            show={boreholeno !== null && intakeno !== null}
            minSize={2}
            maxSize={4}
            onClose={() => setIntakeNo(null)}
            height="100%"
          >
            <AppContext.Provider value={{boreholeno: boreholeno!, intakeno: intakeno!}}>
              <BoreholeRouter />
            </AppContext.Provider>
          </WindowManager.Window>

          <WindowManager.Window
            key="station"
            show={ts_id !== null}
            minSize={2}
            maxSize={3}
            fullScreen={fullScreen}
            onClose={() => setSelectedTask(null)}
            height="100%"
          >
            <AppContext.Provider value={{loc_id: metadata ? metadata.loc_id : -1, ts_id: ts_id!}}>
              <Station />
            </AppContext.Provider>
          </WindowManager.Window>
        </WindowManager>
      </Box>
    </Box>
  );
};

export default TasksOverview;
