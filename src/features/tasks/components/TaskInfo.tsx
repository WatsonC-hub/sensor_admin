import {Box, Grid} from '@mui/material';
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
    <Box display="flex" flexDirection="row" pt={2} maxHeight={'100%'}>
      <Box flexGrow={1} flexBasis={0}>
        <TaskForm key={selectedTask.id} onSubmit={() => {}} defaultValues={defaultValues}>
          <TaskInfoForm selectedTask={selectedTask} />
        </TaskForm>
      </Box>
      <Box flexGrow={1} flexBasis={0}>
        <TaskInfoCommentForm selectedTaskId={selectedTask.id} />
      </Box>
    </Box>
  );
};

export default TaskInfo;
