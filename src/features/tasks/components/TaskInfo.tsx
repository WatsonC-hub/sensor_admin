import {Grid} from '@mui/material';
import React from 'react';

import {useTaskStore} from '../store';

import TaskInfoCommentForm from './TaskInfoCommentForm';
import TaskInfoForm from './TaskInfoForm';

const TaskInfo = () => {
  const {selectedTask} = useTaskStore();

  if (!selectedTask) return <div></div>;

  return (
    <Grid container mt={5}>
      <Grid item xs={6.8}>
        <TaskInfoForm selectedTask={selectedTask} />
      </Grid>
      <Grid item xs={5}>
        <TaskInfoCommentForm selectedTaskId={selectedTask.id} />
      </Grid>
    </Grid>
  );
};

export default TaskInfo;
