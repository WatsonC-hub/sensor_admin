import {useMemo} from 'react';
import {create} from 'zustand';
import {createJSONStorage, devtools, persist} from 'zustand/middleware';

import {useTasks} from './api/useTasks';
import {ID, Task} from './types';

type TaskState = {
  // tasks: Task[];
  // shownTaskIds: ID[];
  shownMapTaskIds: ID[];
  shownListTaskIds: ID[];
  selectedTaskId: ID | null;
  // setTasks: (tasks: Task[]) => void;
  // setShownTaskIds: (ids: ID[]) => void;
  setShownMapTaskIds: (ids: ID[]) => void;
  setShownListTaskIds: (ids: ID[]) => void;
  // setShownTasksByPredicate: (predicate: () => boolean) => void;
  setSelectedTask: (id: ID) => void;
  resetFilter: () => void;
  resetState: () => void;
};

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
    get: {data: tasks},
  } = useTasks();

  const {
    shownListTaskIds,
    shownMapTaskIds,
    selectedTaskId,
    setShownMapTaskIds,
    setShownListTaskIds,
    setSelectedTask,
    resetFilter,
    resetState,
  } = taskStore();

  const {shownTasks, hiddenTasks} = useMemo(() => {
    const shownTasks = filterTasks(tasks, [shownListTaskIds, shownMapTaskIds]);
    // console.log('shownTasks', shownTasks);
    // console.log('shownListTaskIds', shownListTaskIds);
    // console.log('shownMapTaskIds', shownMapTaskIds);

    return {
      shownTasks: shownTasks,
      hiddenTasks: tasks.filter((task) => !shownTasks.includes(task)),
    };
  }, [tasks, shownListTaskIds, shownMapTaskIds]);

  const {selectedTask} = useMemo(() => {
    return {
      selectedTask: selectedTaskId ? tasks.find((task) => task.id === selectedTaskId) : null,
    };
  }, [tasks, selectedTaskId]);

  return {
    tasks,
    shownTasks,
    hiddenTasks,
    selectedTask,
    setSelectedTask,
    shownListTaskIds,
    shownMapTaskIds,
    setShownMapTaskIds,
    setShownListTaskIds,
    // setShownTasksByPredicate: (predicate: () => boolean) => {
    //   setShownTaskIds(tasks.filter(predicate).map((task) => task.id));
    // },
    resetFilter,
    resetState,
  };
};

export const taskStore = create<TaskState>()(
  persist(
    devtools((set) => ({
      shownListTaskIds: [],
      shownMapTaskIds: [],
      selectedTaskId: null,
      setShownListTaskIds: (ids) => set({shownListTaskIds: ids}),
      setShownMapTaskIds: (ids) => set({shownMapTaskIds: ids}),
      setSelectedTask: (id) => set({selectedTaskId: id}),
      resetFilter: () => set({shownListTaskIds: [], shownMapTaskIds: []}),
      resetState: () => set({shownListTaskIds: [], shownMapTaskIds: [], selectedTaskId: null}),
    })),
    {
      name: 'calypso-tasks', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default the 'localStorage' is used
    }
  )
);
