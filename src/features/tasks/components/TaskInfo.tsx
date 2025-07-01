import {Grid} from '@mui/material';
import React, {useMemo} from 'react';

import {useTaskState} from '~/features/tasks/api/useTaskState';
import TaskForm from '~/features/tasks/components/TaskForm';
import TaskInfoCommentForm from '~/features/tasks/components/TaskInfoCommentForm';
import TaskInfoForm from '~/features/tasks/components/TaskInfoForm';
import useLocationTaskHistory from '../api/useLocationTaskHistory';
import {useDisplayState} from '~/hooks/ui';

const TaskInfo = () => {
  const [loc_id, selectedTaskId] = useDisplayState((state) => [state.loc_id, state.selectedTask]);

  const {selectedTask} = useTaskState();
  const {data: taskHistoryList} = useLocationTaskHistory(loc_id ?? undefined);
  let task = selectedTask;
  if (selectedTask === undefined && selectedTaskId !== undefined) {
    task = taskHistoryList?.find((task) => task.id === selectedTaskId);
  }

  const defaultValues = useMemo(() => {
    if (!task) return;
    return {
      name: task.name,
      description: task.description,
      status_id: task.status_id,
      due_date: task.due_date,
      assigned_to: task.assigned_to,
      loctypename: task.loctypename,
      tstype_name: task.tstype_name,
      projectno: task.projectno,
      project_text: task.project_text,
      location_name: task.location_name,
      blocks_notifications:
        task.blocks_notifications && task.blocks_notifications.length !== 0
          ? task.blocks_notifications.length === 1
            ? task.blocks_notifications
            : ('alle' as const)
          : undefined,
      block_on_location: task.block_on_location ? 'true' : 'false',
      block_all: task.block_all ? 'true' : 'false',
    };
  }, [task, taskHistoryList]);

  if (!task) return null;

  return (
    <Grid container spacing={2} p={1}>
      <Grid item xs={12} lg={6}>
        <TaskForm
          key={task.id}
          disabled={!task.can_edit}
          onSubmit={() => {}}
          defaultValues={defaultValues}
        >
          <TaskInfoForm selectedTask={task} />
        </TaskForm>
      </Grid>
      <Grid item xs={12} lg={6}>
        <TaskInfoCommentForm selectedTaskId={task.id} />
      </Grid>
    </Grid>
  );
};

export default TaskInfo;
