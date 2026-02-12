import {useMemo} from 'react';

import {useTasks} from './useTasks';
import {useDisplayState} from '~/hooks/ui';

export const useTaskState = () => {
  const selectedTaskId = useDisplayState((state) => state.selectedTask);
  const {data: tasks} = useTasks();

  const {selectedTask} = useMemo(() => {
    if (!tasks) {
      return {selectedTask: null};
    }
    return {
      selectedTask: selectedTaskId ? tasks.find((task) => task.id === selectedTaskId) : null,
    };
  }, [tasks, selectedTaskId]);

  return {
    tasks,
    selectedTask,
  };
};
