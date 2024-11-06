import React from 'react';

import {useTaskStore} from '../store';

const TaskInfo = () => {
  const {selectedTask, selectedTaskId} = useTaskStore();
  console.log('selectedTask', selectedTask);
  return <div>{JSON.stringify(selectedTask)}</div>;
};

export default TaskInfo;
