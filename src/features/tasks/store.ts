import {create} from 'zustand';
import {createJSONStorage, devtools, persist} from 'zustand/middleware';

import {Task} from './types';

type TaskState = {
  tasks: Task[];
  shownTasks: Task[];
  hiddenTasks: Task[];
  setTasks: (tasks: Task[]) => void;
  setShownTasks: (tasks: Task[]) => void;
  setShownTasksByPredicate: (predicate: () => boolean) => void;
  setShowTasksByIds: (ids: string[]) => void;
  resetState: () => void;
};

const hiddenTasks = (tasks: Task[], shownTasks: Task[]) =>
  tasks.filter((task) => !shownTasks.map((item) => item.id).includes(task.id));

export const taskStore = create<TaskState>()(
  persist(
    devtools((set) => ({
      tasks: [],
      shownTasks: [],
      hiddenTasks: [],
      setTasks: (tasks) => {
        set(
          (state) => {
            if (state.shownTasks.length === 0) {
              return {
                tasks,
                shownTasks: tasks,
                hiddenTasks: [],
              };
            }
            return {
              tasks,
              shownTasks: tasks.filter((task) =>
                state.shownTasks.map((item) => item.id).includes(task.id)
              ),
              hiddenTasks: hiddenTasks(tasks, state.shownTasks),
            };
          },
          false,
          'setTasks'
        );
      },
      setShownTasks: (tasks) => {
        set(
          (state) => {
            return {
              shownTasks: tasks,
              hiddenTasks: hiddenTasks(state.tasks, tasks),
            };
          },
          false,
          'setHiddenTasks'
        );
      },
      setShownTasksByPredicate: (predicate) => {
        set(
          (state) => {
            const shownTasks = state.tasks.filter(predicate);
            return {
              shownTasks,
              hiddenTasks: hiddenTasks(state.tasks, shownTasks),
            };
          },
          false,
          'filterTasks'
        );
      },
      setShowTasksByIds: (ids) => {
        set(
          (state) => {
            const shownTasks = state.tasks.filter((task) => ids.includes(task.id));
            return {
              shownTasks,
              hiddenTasks: hiddenTasks(state.tasks, shownTasks),
            };
          },
          false,
          'setFilteredTasksByIds'
        );
      },
      resetFilter: () => {
        set(
          (state) => {
            return {
              shownTasks: state.tasks,
              hiddenTasks: [],
            };
          },
          false,
          'resetFilter'
        );
      },
      resetState: () => {
        set({tasks: [], shownTasks: [], hiddenTasks: []}, false, 'resetState');
      },
    })),
    {
      name: 'calypso-tasks', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default the 'localStorage' is used
    }
  )
);
