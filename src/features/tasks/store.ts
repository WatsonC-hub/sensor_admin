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
  // setTasks: (tasks: Task[]) => void;
  // setShownTaskIds: (ids: ID[]) => void;
  setShownMapTaskIds: (ids: ID[]) => void;
  setShownListTaskIds: (ids: ID[]) => void;
  // setShownTasksByPredicate: (predicate: () => boolean) => void;
  setSelectedLocIds: (loc_ids: Array<number>) => void;
  setSelectedTask: (id: ID) => void;
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
      setShownListTaskIds: (ids) => set({shownListTaskIds: ids}),
      setShownMapTaskIds: (ids) => set({shownMapTaskIds: ids}),
      setSelectedTask: (id) => set({selectedTaskId: id}),
      setSelectedLocIds: (tasks) => set({selectedLocIds: tasks}),
      resetFilter: () => set({shownListTaskIds: [], shownMapTaskIds: []}),
      resetState: () => set({shownListTaskIds: [], shownMapTaskIds: [], selectedTaskId: null}),
    })),
    {
      name: 'calypso-tasks', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default the 'localStorage' is used
    }
  )
);
