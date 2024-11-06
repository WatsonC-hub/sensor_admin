import {create} from 'zustand';
import {createJSONStorage, devtools, persist} from 'zustand/middleware';

import {useTasks} from './api/useTasks';
import {Task, ID} from './types';

type TaskState = {
  // tasks: Task[];
  shownTaskIds: ID[];
  selectedTaskId: ID | null;
  // setTasks: (tasks: Task[]) => void;
  setShownTaskIds: (ids: ID[]) => void;
  // setShownTasksByPredicate: (predicate: () => boolean) => void;
  setSelectedTask: (id: ID) => void;
  resetFilter: () => void;
  resetState: () => void;
};

const hiddenTasks = (tasks: Task[], shownTasks: Task[]) =>
  tasks.filter((task) => !shownTasks.map((item) => item.id).includes(task.id));

export const useTaskStore = () => {
  const {
    get: {data: tasks},
  } = useTasks();
  const {shownTaskIds, selectedTaskId, setShownTaskIds, setSelectedTask, resetFilter, resetState} =
    taskStore();

  return {
    tasks,
    shownTasks:
      shownTaskIds.length == 0
        ? tasks
        : shownTaskIds.map((id) => tasks.find((task) => task.id === id)!),
    hiddenTasks: hiddenTasks(
      tasks,
      shownTaskIds.map((id) => tasks.find((task) => task.id === id)!)
    ),
    selectedTask: selectedTaskId ? tasks.find((task) => task.id === selectedTaskId) : null,
    setSelectedTask,
    setShownTaskIds,
    setShownTasksByPredicate: (predicate: () => boolean) => {
      setShownTaskIds(tasks.filter(predicate).map((task) => task.id));
    },
    resetFilter,
    resetState,
  };
};

export const taskStore = create<TaskState>()(
  persist(
    devtools((set) => ({
      shownTaskIds: [],
      selectedTaskId: null,
      setShownTaskIds: (ids) => set({shownTaskIds: ids}),
      setSelectedTask: (id) => set({selectedTaskId: id}),
      resetFilter: () => set({shownTaskIds: []}),
      resetState: () => set({shownTaskIds: [], selectedTaskId: null}),
    })),
    {
      name: 'calypso-tasks', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default the 'localStorage' is used
    }
  )
);
