import {Delete} from '@mui/icons-material';
// import DragHandleIcon from '@mui/icons-material/DragHandle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import React, {useState} from 'react';
import {FieldValues, useFormContext} from 'react-hook-form';

import Button from '~/components/Button';
import DeleteAlert from '~/components/DeleteAlert';
import {useTasks} from '~/features/tasks/api/useTasks';
import TaskForm from '~/features/tasks/components/TaskForm';
import {Task} from '~/features/tasks/types';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

// import {useTaskStore} from '../api/useTaskStore';

type TaskInfoFormProps = {
  selectedTask: Task;
};

const TaskInfoForm = ({selectedTask}: TaskInfoFormProps) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  // const {setIsDraggingTask} = useTaskStore();
  const deleteTaskTitle = selectedTask.id.includes(':') ? 'Notifikationen kan ikke slettes' : '';
  // const removeFromItineraryTitle = !selectedTask.itinerary_id
  //   ? 'Opgaven er ikke tilknyttet en tur'
  //   : '';
  const {station, adminKvalitetssikring} = useNavigationFunctions();
  const {
    patch,
    del,
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

  // const removeFromItinerary = () => {
  //   console.log(selectedTask);
  //   deleteTaskFromItinerary.mutate({
  //     path: `${selectedTask.itinerary_id}/tasks/${selectedTask.id}`,
  //   });
  // };

  const deleteTask = () => {
    del.mutate({
      path: `${selectedTask.id}`,
    });
  };

  return (
    <Box display={'flex'} flexDirection={'column'} gap={2}>
      <Stack display={'flex'} flexDirection={'row'} justifyContent={'space-evenly'}>
        <Button bttype="tertiary" onClick={() => station(selectedTask.loc_id, selectedTask.ts_id)}>
          <Typography>Gå til tidsserie</Typography>
        </Button>
        <Button bttype="tertiary" onClick={() => adminKvalitetssikring(selectedTask.ts_id)}>
          <Typography>Gå til QA</Typography>
        </Button>
      </Stack>
      <Grid container spacing={0}>
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
          <TaskForm.DueDate
            onBlurCallback={async () => await handlePatch('due_date')}
            disabled={selectedTask.itinerary_id !== null}
          />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.AssignedTo
            onBlur={async () => {
              await handlePatch('assigned_to');
            }}
            disabled={selectedTask.itinerary_id !== null}
          />
        </Grid>
        <Grid item mobile={12} py={1}>
          <Accordion
            disableGutters={true}
            sx={{
              border: '1px solid',
              borderColor: 'primary.main',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              Flere informationer
            </AccordionSummary>
            <AccordionDetails>
              <Grid
                container
                display={'flex'}
                flexDirection={'row'}
                alignItems={'center'}
                spacing={1}
                px={1}
              >
                <Grid
                  item
                  mobile={12}
                  laptop={6}
                  display={'flex'}
                  flexDirection={'row'}
                  alignItems={'center'}
                  gap={2}
                >
                  <Typography>Bloker</Typography>
                  <TaskForm.BlockAll
                    onBlurCallback={async () => await handlePatch('block_all')}
                    onChangeCallback={(e) => {
                      console.log(e);
                    }}
                  />
                </Grid>
                <Grid
                  item
                  mobile={12}
                  laptop={6}
                  display={'flex'}
                  flexDirection={'row'}
                  alignItems={'center'}
                  gap={2}
                  mt={-3}
                >
                  <Typography>notifikationer på</Typography>
                  <TaskForm.BlockOnLocation
                    onBlurCallback={async () => await handlePatch('block_on_location')}
                  />
                </Grid>
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
            </AccordionDetails>
          </Accordion>
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

      <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={2}>
        {/* <div
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
            setIsDraggingTask(true);
            e.dataTransfer.setData('text/plain', JSON.stringify(selectedTask));
          }}
          onDragEnd={() => {
            setIsDraggingTask(false);
          }}
        >
          <DragHandleIcon fontSize="large" />
        </div> */}

        <Box>
          <Tooltip arrow title={deleteTaskTitle}>
            <div>
              <Button
                bttype="primary"
                disabled={selectedTask.id.includes(':') || selectedTask.can_edit === false}
                onClick={() => setDialogOpen(true)}
                startIcon={<Delete />}
              >
                Slet
              </Button>
            </div>
          </Tooltip>
        </Box>

        <Box>
          {/* <Tooltip arrow title={removeFromItineraryTitle}> */}
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
          {/* </Tooltip> */}
        </Box>
      </Box>
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        measurementId={selectedTask.id}
        onOkDelete={() => {
          deleteTask();
        }}
      />
    </Box>
  );
};

export default TaskInfoForm;
