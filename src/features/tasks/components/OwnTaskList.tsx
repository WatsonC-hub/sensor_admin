import {Box, Typography} from '@mui/material';

import {useUser} from '~/features/auth/useUser';
import {useTasks} from '../api/useTasks';
import TaskListItemAdvancedCard from '~/features/station/components/sensorContent/taskListItemComponents/TaskListItemAdvancedCard';
import {useVirtualizer} from '@tanstack/react-virtual';
import {useCallback, useMemo, useRef} from 'react';
import {createSmoothScrollToFn} from '../helpers';

const OwnTaskList = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const insertionDirection = useRef<'forward' | 'backward'>('forward');
  const getScrollElement = useCallback(() => parentRef.current, []);
  const user = useUser();
  const {
    get: {data: tasks},
  } = useTasks();

  const scrollToFn = useCallback(
    () => createSmoothScrollToFn(getScrollElement, 800),
    [getScrollElement]
  );

  const own_task_list = useMemo(
    () =>
      tasks?.filter(
        (task) => task.assigned_to === user?.user_id.toString() && task.status_id !== 2
      ),
    [tasks, user]
  );

  const virtualizer = useVirtualizer({
    count: own_task_list?.length ?? 0,
    getScrollElement,
    estimateSize: useCallback(() => 20, []),
    enabled: true,
    scrollToFn,
    onChange: (instance) => {
      if (instance.scrollDirection) {
        insertionDirection.current = instance.scrollDirection;
      }
    },
  });

  const items = virtualizer.getVirtualItems();

  return (
    <Box maxHeight={'100%'} display="flex" flexDirection="column">
      <Typography variant="h6" sx={{padding: 1}}>
        Mine Opgaver
      </Typography>
      <Box
        ref={parentRef}
        sx={{
          flexGrow: 1,
          width: '100%',
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {own_task_list &&
            own_task_list.length > 0 &&
            items.map((virtualRow) => {
              const task = own_task_list[virtualRow.index];

              return (
                <Box
                  key={task?.id}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    padding: 1,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <TaskListItemAdvancedCard task={task} />
                </Box>
              );
            })}
        </Box>
      </Box>
    </Box>
  );
};

export default OwnTaskList;
