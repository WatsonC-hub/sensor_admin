import {Task} from './types';

export const isSimpleTask = (task: Task) => {
  return (
    task.blocks_notifications.length === 1 &&
    !task.is_created &&
    (task.blocks_notifications[0] === 1 || task.blocks_notifications[0] === 207)
  );
};
