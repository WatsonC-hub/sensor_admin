import {useMemo} from 'react';

import {useRawTaskStore} from '../store';

import {useTasks} from './useTasks';

export const useTaskStore = () => {
  const {
    selectedTaskId,
    selectedLocIds,
    isDraggingTask,
    setSelectedTask,
    setSelectedLocIds,
    setIsDraggingTask,
  } = useRawTaskStore((state) => state);

  const {
    get: {data: tasks},
  } = useTasks();

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
    selectedLocIds,
    isDraggingTask,

    setSelectedTask,

    setSelectedLocIds,
    setIsDraggingTask,
  };
};
