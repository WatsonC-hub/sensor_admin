import {create} from 'zustand';
import {createJSONStorage, devtools, persist} from 'zustand/middleware';

import {ID} from './types';

type TaskState = {
  // tasks: Task[];
  // shownTaskIds: ID[];
  shownMapTaskIds: ID[];
  shownListTaskIds: ID[];
  selectedTaskId: ID | null;
  selectedLocIds: Array<number>;
  isDraggingTask: boolean;
  includeClosedTasks: boolean;
  // setTasks: (tasks: Task[]) => void;
  // setShownTaskIds: (ids: ID[]) => void;
  setShownMapTaskIds: (ids: ID[]) => void;
  setShownListTaskIds: (ids: ID[]) => void;
  // setShownTasksByPredicate: (predicate: () => boolean) => void;
  setSelectedLocIds: (loc_ids: Array<number>) => void;
  setIsDraggingTask: (isDraggingTask: boolean) => void;
  setIncludeClosedTasks: (includeClosedTasks: boolean) => void;
  setSelectedTask: (id: ID | null) => void;
  resetFilter: () => void;
  resetState: () => void;
};

export const taskStore = create<TaskState>()(
  persist(
    devtools((set) => ({
      shownListTaskIds: [],
      shownMapTaskIds: [],
      selectedTaskId: null,
      selectedLocIds: [],
      isDraggingTask: false,
      includeClosedTasks: true,
      setShownListTaskIds: (ids) => set({shownListTaskIds: ids}),
      setShownMapTaskIds: (ids) => set({shownMapTaskIds: ids}),
      setSelectedTask: (id) => set({selectedTaskId: id}),
      setSelectedLocIds: (tasks) => set({selectedLocIds: tasks}),
      setIsDraggingTask: (isDraggingTask) => set({isDraggingTask: isDraggingTask}),
      setIncludeClosedTasks: (includeClosedTasks) => set({includeClosedTasks: includeClosedTasks}),
      resetFilter: () => set({shownListTaskIds: [], shownMapTaskIds: []}),
      resetState: () => set({shownListTaskIds: [], shownMapTaskIds: [], selectedTaskId: null}),
    })),
    {
      name: 'calypso-tasks', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default the 'localStorage' is used
    }
  )
);
