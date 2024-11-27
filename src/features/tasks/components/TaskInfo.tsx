import {Grid} from '@mui/material';
import React, {useMemo} from 'react';

import TaskForm from '~/features/tasks/components/TaskForm';
import TaskInfoCommentForm from '~/features/tasks/components/TaskInfoCommentForm';
import TaskInfoForm from '~/features/tasks/components/TaskInfoForm';
import {useTaskStore} from '~/features/tasks/store';

const TaskInfo = () => {
  const {selectedTask} = useTaskStore();

  const defaultValues = useMemo(() => {
    if (!selectedTask) return;
    return {
      name: selectedTask.name,
      description: selectedTask.description,
      status_id: selectedTask.status_id,
      due_date: selectedTask.due_date,
      assigned_to: selectedTask.assigned_to,
      loctypename: selectedTask.loctypename,
      tstype_name: selectedTask.tstype_name,
      projectno: selectedTask.projectno,
      project_text: selectedTask.project_text,
      location_name: selectedTask.location_name,
      blocks_notifications:
        selectedTask.blocks_notifications && selectedTask.blocks_notifications.length !== 0
          ? selectedTask.blocks_notifications.length === 1
            ? selectedTask.blocks_notifications
            : ('alle' as const)
          : undefined,
    };
  }, [selectedTask]);

  if (!selectedTask) return <div></div>;

  return (
    <Grid container mt={5}>
      <Grid item xs={6.8}>
        <TaskForm key={selectedTask.id} onSubmit={() => {}} defaultValues={defaultValues}>
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
