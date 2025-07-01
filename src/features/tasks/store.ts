import {create} from 'zustand';
import {createJSONStorage, devtools, persist} from 'zustand/middleware';
import {useShallow} from 'zustand/shallow';

import {ID} from './types';

type TaskState = {
  // tasks: Task[];
  // shownTaskIds: ID[];
  selectedTaskId: ID | null;
  selectedLocIds: Array<number>;
  isDraggingTask: boolean;
  // setTasks: (tasks: Task[]) => void;
  // setShownTaskIds: (ids: ID[]) => void;
  // setShownTasksByPredicate: (predicate: () => boolean) => void;
  setSelectedLocIds: (loc_ids: Array<number>) => void;
  setIsDraggingTask: (isDraggingTask: boolean) => void;
  setSelectedTask: (id: ID | null) => void;
};

export const taskStore = create<TaskState>()(
  persist(
    devtools((set) => ({
      selectedTaskId: null,
      selectedLocIds: [],
      isDraggingTask: false,
      setSelectedTask: (id) => set({selectedTaskId: id}),
      setSelectedLocIds: (loc_ids) => set({selectedLocIds: loc_ids}),
      setIsDraggingTask: (isDraggingTask) => set({isDraggingTask: isDraggingTask}),
    })),
    {
      name: 'calypso-tasks', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default the 'localStorage' is used
    }
  )
);

export const useRawTaskStore = <T>(selector: (state: TaskState) => T) => {
  return taskStore(useShallow(selector));
};
