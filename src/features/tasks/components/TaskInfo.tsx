import {Grid} from '@mui/material';
import React from 'react';

import {useTaskStore} from '../store';

import TaskForm from './TaskForm';
import TaskInfoCommentForm from './TaskInfoCommentForm';
import TaskInfoForm from './TaskInfoForm';

const TaskInfo = () => {
  const {selectedTask} = useTaskStore();

  if (!selectedTask) return <div></div>;

  return (
    <Grid container mt={5}>
      <Grid item xs={6.8}>
        <TaskForm
          key={selectedTask.id}
          onSubmit={() => {}}
          defaultValues={{
            name: selectedTask.name,
            description: selectedTask.description,
            status_id: selectedTask.status_id,
            due_date: selectedTask.due_date,
            assigned_to: selectedTask.assigned_to ?? '',
            ts_id: selectedTask.ts_id,
          }}
        >
          <TaskInfoForm selectedTask={selectedTask} />
        </TaskForm>
      </Grid>
      <Grid item xs={5}>
        <TaskInfoCommentForm selectedTaskId={selectedTask.id} />
      </Grid>
    </Grid>
  );
};

export default TaskInfo;
