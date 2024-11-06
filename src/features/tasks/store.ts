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
  const shownTasks = tasks.filter((task) => ids.flat().includes(task.id));

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
    return {
      shownTasks: filterTasks(tasks, [shownListTaskIds, shownMapTaskIds]),
      hiddenTasks: tasks.filter(
        (task) => !shownListTaskIds.includes(task.id) && !shownMapTaskIds.includes(task.id)
      ),
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
      // setShownTaskIds: (ids) => set({shownTaskIds: ids}),
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
