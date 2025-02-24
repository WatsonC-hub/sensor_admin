import {useMemo} from 'react';

import {useRawTaskStore} from '../store';
import {ID, Task} from '../types';

import {useTasks} from './useTasks';

const filterTasks = (tasks: Task[], ids: ID[][]) => {
  const overlappingIds = ids.reduce(
    (acc, curr) => {
      if (curr.length === 0) {
        return acc;
      }
      if (acc.size === 0) {
        return new Set(curr);
      }

      return new Set([...curr].filter((id) => acc.has(id)));
    },
    new Set<ID>([...ids[0]])
  );

  const shownTasks = tasks.filter((task) => overlappingIds.has(task.id));

  return shownTasks.length == 0 ? tasks : shownTasks;
};

export const useTaskStore = () => {
  const {
    shownListTaskIds,
    shownMapTaskIds,
    selectedTaskId,
    includeClosedTasks,
    selectedLocIds: selectedLocIds,
    isDraggingTask,
    setShownMapTaskIds,
    setShownListTaskIds,
    setSelectedTask,
    setSelectedLocIds,
    setIsDraggingTask,
    setIncludeClosedTasks,
    resetFilter,
    resetState,
  } = useRawTaskStore((state) => state);

  const {
    get: {data: tasks},
  } = useTasks();

  const {shownTasks, hiddenTasks, mapFilteredTasks} = useMemo(() => {
    if (!tasks) {
      return {shownTasks: [], hiddenTasks: [], mapFilteredTasks: []};
    }
    const shownTasks = filterTasks(tasks, [shownListTaskIds, shownMapTaskIds]);
    // console.log('shownTasks', shownTasks);
    // console.log('shownListTaskIds', shownListTaskIds);
    // console.log('shownMapTaskIds', shownMapTaskIds);
    const mapFilteredTasks = filterTasks(tasks, [shownMapTaskIds]);

    return {
      shownTasks: shownTasks,
      mapFilteredTasks,
      hiddenTasks: tasks.filter((task) => !shownTasks.includes(task)),
    };
  }, [tasks, shownListTaskIds, shownMapTaskIds]);

  const {selectedTask} = useMemo(() => {
    if (!tasks) {
      return {selectedTask: null};
    }
    return {
      selectedTask: selectedTaskId ? tasks.find((task) => task.id === selectedTaskId) : null,
    };
  }, [tasks, selectedTaskId]);

  const activeTasks = useMemo(() => {
    if (!tasks) {
      return [];
    }

    return tasks.filter((task) => task.status_category != 'closed');
  }, [tasks]);

  return {
    tasks,
    shownTasks,
    mapFilteredTasks,
    activeTasks,
    hiddenTasks,
    selectedTask,
    selectedLocIds,
    isDraggingTask,
    includeClosedTasks,
    setSelectedTask,
    shownListTaskIds,
    shownMapTaskIds,
    setShownMapTaskIds,
    setShownListTaskIds,
    setSelectedLocIds,
    setIsDraggingTask,
    setIncludeClosedTasks,
    resetFilter,
    resetState,
  };
};
