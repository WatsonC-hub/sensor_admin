import {useMemo} from 'react';

import {useDisplayState} from '~/hooks/ui';

import {useTasks} from './useTasks';

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
