import {Delete} from '@mui/icons-material';
// import DragHandleIcon from '@mui/icons-material/DragHandle';
import {Box, Grid, IconButton, TextField, Tooltip, Typography} from '@mui/material';
import React, {useState} from 'react';
import {FieldValues, useFormContext} from 'react-hook-form';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import Button from '~/components/Button';
import DeleteAlert from '~/components/DeleteAlert';
import {useTasks} from '~/features/tasks/api/useTasks';
import TaskForm from '~/features/tasks/components/TaskForm';
import {Task} from '~/features/tasks/types';
import {useDisplayState} from '~/hooks/ui';

// import {useTaskStore} from '../api/useTaskStore';

type TaskInfoFormProps = {
  selectedTask: Task;
};

const TaskInfoForm = ({selectedTask}: TaskInfoFormProps) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dueDateDialogOpen, setDueDateDialogOpen] = useState<boolean>(false);
  const deleteTaskTitle = selectedTask.id.includes(':') ? 'Notifikationen kan ikke slettes' : '';

  const setSelectedTask = useDisplayState((state) => state.setSelectedTask);
  // const removeFromItineraryTitle = !selectedTask.itinerary_id
  //   ? 'Opgaven er ikke tilknyttet en tur'
  //   : '';
  const {
    patch,
    del,
    getStatus: {data: taskStatus},
    getUsers: {data: taskUsers},
  } = useTasks();
  const {
    trigger,
    getValues,
    reset,
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

    if (field_name === 'block_all') {
      if (field_value === 'false') values.block_all = false;
      else values.block_all = true;
    }

    if (field_name === 'block_on_location') {
      if (field_value === 'false') values.block_on_location = false;
      else values.block_on_location = true;
    }

    if (validated && isDirty) {
      handleSubmit(values);
    }
  };

  const deleteTask = () => {
    del.mutate({
      path: `${selectedTask.id}`,
    });
  };

  return (
    <Box display={'flex'} flexDirection={'column'}>
      <Typography variant="h6" fontWeight={600} mb={1}>
        Opgaveoplysninger
      </Typography>
      <Typography>
        Tidsserie: {selectedTask.tstype_name}{' '}
        {selectedTask.prefix ? ' - ' + selectedTask.prefix : ''}
      </Typography>
      <Grid container spacing={1}>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.Input
            sx={{pb: 0}}
            label={'Opgavenavn'}
            name="name"
            onBlurCallback={async () => await handlePatch('name')}
          />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.StatusSelect onBlurCallback={async () => await handlePatch('status_id')} />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.DueDate
            onBlurCallback={async () => await handlePatch('due_date')}
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton
                    disabled={!selectedTask.can_edit}
                    size="small"
                    onClick={() => {
                      setDueDateDialogOpen(true);
                    }}
                  >
                    <MoreTimeIcon fontSize="small" />
                  </IconButton>
                ),
              },
            }}
          />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6} alignContent={'center'} pb={0.5}>
          {selectedTask.can_edit ? (
            <TaskForm.AssignedTo
              onBlur={async () => {
                await handlePatch('assigned_to');
              }}
            />
          ) : (
            <TextField
              label="Tildelt"
              value={selectedTask.assigned_display_name}
              slotProps={{
                inputLabel: {shrink: true},
              }}
              fullWidth
              disabled
              sx={{
                pb: 0,
                '& .MuiInputBase-input': {
                  padding: '8.2px !important',
                },
              }}
            />
          )}
        </Grid>
        <Grid item mobile={12} pb={1}>
          <Grid container display={'flex'} flexDirection={'row'} alignItems={'start'} spacing={0}>
            <Grid
              item
              mobile={12}
              laptop={12}
              display={'flex'}
              flexDirection={'row'}
              alignItems={'center'}
              gap={1}
            >
              <Typography>Bloker</Typography>
              <TaskForm.BlockAll
                sx={{pb: 0}}
                onBlurCallback={async () => await handlePatch('block_all')}
                onChangeCallback={(e) => {
                  console.log(e);
                }}
              />
            </Grid>
            <Grid
              item
              mobile={12}
              laptop={12}
              display={'flex'}
              flexDirection={'row'}
              alignItems={'center'}
              gap={1}
            >
              <Typography>på</Typography>
              <TaskForm.BlockOnLocation
                sx={{pb: 0}}
                onBlurCallback={async () => await handlePatch('block_on_location')}
              />
            </Grid>
          </Grid>
        </Grid>
        {/* <Grid item mobile={12} tablet={12} laptop={6}>
        </Grid> */}

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
      <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={1}>
        <Box>
          <Tooltip arrow title={deleteTaskTitle}>
            <Button
              bttype="primary"
              disabled={
                selectedTask.id.includes(':') ||
                selectedTask.can_edit === false ||
                selectedTask.status_category === 'closed'
              }
              onClick={() => setDialogOpen(true)}
              startIcon={<Delete />}
            >
              Slet
            </Button>
          </Tooltip>
        </Box>

        {/* <Box>

          <div>
            <Button
              bttype="primary"
              disabled={
                selectedTask.status_category === 'closed' ||
                selectedTask.can_edit === false ||
                selectedTask.id.includes(':')
              }
              onClick={() => handleSubmit({status_id: 3})}
            >
              Færdiggør
            </Button>
          </div>

        </Box> */}
      </Box>
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        measurementId={selectedTask.id}
        onOkDelete={() => {
          deleteTask();
          setSelectedTask(null);
        }}
      />
      <TaskForm.DueDateDialog
        ts_id={selectedTask.ts_id}
        open={dueDateDialogOpen}
        onSubmit={async () => {
          await handlePatch('due_date');
          setDueDateDialogOpen(false);
        }}
        onClose={() => {
          setDueDateDialogOpen(false);
          reset();
        }}
      />
    </Box>
  );
};

export default TaskInfoForm;
