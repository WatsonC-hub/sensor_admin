import DragHandleIcon from '@mui/icons-material/DragHandle';
import {Box, Grid, Stack, Typography} from '@mui/material';
import React from 'react';
import {FieldValues, useFormContext} from 'react-hook-form';

import Button from '~/components/Button';
import {useTasks} from '~/features/tasks/api/useTasks';
import TaskForm from '~/features/tasks/components/TaskForm';
import {Task} from '~/features/tasks/types';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

type TaskInfoFormProps = {
  selectedTask: Task;
};

const TaskInfoForm = ({selectedTask}: TaskInfoFormProps) => {
  const {station, adminKvalitetssikring} = useNavigationFunctions();
  const {
    patch,
    getStatus: {data: taskStatus},
    getUsers: {data: taskUsers},
  } = useTasks();
  const {
    trigger,
    getValues,
    formState: {dirtyFields},
  } = useFormContext();

  const handleSubmit = (values: Partial<FieldValues>) => {
    const payload = {
      path: `${selectedTask.id}`,
      data: {ts_id: selectedTask.ts_id, ...values},
    };
    patch.mutate(payload);
  };

  const handlePatch = async (field_name: keyof FieldValues) => {
    const validated = await trigger(field_name);
    let field_value = getValues(field_name);

    const isDirty = dirtyFields[field_name];

    if (field_name === 'due_date' && field_value === '') field_value = null;

    const values = {[field_name]: field_value};

    if (field_name === 'assigned_to') {
      values.assigned_display_name = taskUsers?.find(
        (user) => user.id === field_value
      )?.display_name;
    }

    if (field_name === 'status_id') {
      values.status_name = taskStatus?.find((status) => status.id === field_value)?.name;
      values.status_category = taskStatus?.find((status) => status.id === field_value)?.category;
    }

    if (validated && isDirty) {
      handleSubmit(values);
    }
  };

  return (
    <Box display={'flex'} flexDirection={'column'} mx={2} gap={2}>
      <Stack display={'flex'} flexDirection={'row'} justifyContent={'space-evenly'}>
        <Button bttype="tertiary" onClick={() => station(selectedTask.loc_id, selectedTask.ts_id)}>
          <Typography>Gå til tidsserie</Typography>
        </Button>
        <Button bttype="tertiary" onClick={() => adminKvalitetssikring(selectedTask.ts_id)}>
          <Typography>Gå til QA</Typography>
        </Button>
      </Stack>
      <Grid container spacing={1}>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.Input
            label={'Navn'}
            name="name"
            onBlurCallback={async () => await handlePatch('name')}
          />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.StatusSelect
            onBlurCallback={async () => await handlePatch('status_id')}
            sx={{
              mb: 2,
            }}
          />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.DueDate onBlurCallback={async () => await handlePatch('due_date')} />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.AssignedTo
            onBlur={async () => {
              await handlePatch('assigned_to');
            }}
          />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.BlockAll onChangeCallback={async () => await handlePatch('block_all')} />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.BlockOnLocation
            onChangeCallback={async () => await handlePatch('block_on_location')}
          />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.Input label="Lokationsnavn" name="location_name" disabled />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.Input label="Lokationstype" name="loctypename" disabled />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.Input label="Tidsserie type" name="tstype_name" disabled />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.Input label="Projektnummer" name="projectno" disabled />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={12}>
          <TaskForm.Input label="Projektinfo" name="project_text" disabled />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={12}>
          <TaskForm.Input
            label="Beskrivelse"
            name="description"
            multiline={true}
            rows={5}
            placeholder="Indtæst opgavebeskrivelse..."
            onBlurCallback={async () => await handlePatch('description')}
          />
        </Grid>
      </Grid>

      <div
        id="drag-handle"
        draggable
        style={{
          cursor: 'move',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '50px',
          height: '50px',
          backgroundColor: 'lightgrey',
          borderRadius: '5px',
          margin: '5px',
        }}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', JSON.stringify(selectedTask));
        }}
      >
        <DragHandleIcon fontSize="large" />
      </div>
    </Box>
  );
};

export default TaskInfoForm;
