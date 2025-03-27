import {Box, Typography, Card} from '@mui/material';
import React from 'react';
import {Person} from '@mui/icons-material';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';

import {useTaskStore} from '~/features/tasks/api/useTaskStore';

import {useTaskItinerary} from '../api/useTaskItinerary';

import Droppable from './Droppable';
import {useTasks} from '../api/useTasks';
import {Task} from '../types';
import {convertToShorthandDate} from '~/helpers/dateConverter';
import {useDisplayState} from '~/hooks/ui';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import TaskForm from './TaskForm';

const TaskItiniaries = () => {
  const {
    get: {data},
  } = useTaskItinerary();

  const setItineraryId = useDisplayState((state) => state.setItineraryId);

  const {
    getUsers: {data: users},
    moveTask,
  } = useTasks();
  const {tasks} = useTaskStore();
  const {patch: updateItinerary} = useTaskItinerary();

  return (
    <Box>
      <Box display="flex" gap={1} mt={4} p={0.5} flexDirection={'column'}>
        {data?.map((itinerary) => {
          const itinerary_tasks = tasks?.filter((task) => task.itinerary_id === itinerary.id);
          const ids = itinerary_tasks?.map((task) => task.id);
          const loc_ids = [...new Set(itinerary_tasks?.map((task) => task.loc_id))];
          const grouped_location_tasks = itinerary_tasks?.reduce(
            (acc: Record<number, Task[]>, task) => {
              if (!acc[task.loc_id]) {
                acc[task.loc_id] = [];
              }
              acc[task.loc_id].push(task);
              return acc;
            },
            {}
          );

          const due_date = itinerary.due_date
            ? convertToShorthandDate(itinerary.due_date)
            : 'Ingen dato';

          return (
            <Droppable<{loc_id: number}>
              key={itinerary.id}
              onDrop={(e, data) => {
                e.preventDefault();
                if (!loc_ids.includes(data.loc_id) && ids) {
                  const task_ids = tasks
                    ?.filter((task) => task.loc_id === data.loc_id)
                    .map((task) => task.id);
                  if (task_ids) {
                    const payload = {
                      path: `${itinerary.id}`,
                      data: {
                        task_ids: task_ids,
                        loc_id: [data.loc_id],
                      },
                    };
                    moveTask.mutate(payload);
                  }
                }
              }}
            >
              {({isDraggingOver}) => {
                return (
                  <Card key={itinerary.id} sx={{borderRadius: 2.5}}>
                    <Box
                      display="flex"
                      gap={1}
                      flexDirection={'row'}
                      sx={{
                        textAlign: 'center',
                        justifyContent: 'center',
                        alignContent: 'center',
                        borderRadius: 2,
                        boxShadow: 8,
                        backgroundColor: !isDraggingOver ? 'primary.light' : 'secondary.light',
                        color: 'primary.contrastText',
                        cursor: 'pointer',
                      }}
                    >
                      <Box
                        component="span"
                        display={'flex'}
                        width={'20%'}
                        color={'white'}
                        justifyContent={'center'}
                        alignItems={'center'}
                        sx={{backgroundColor: 'primary.main'}}
                      >
                        <Box display={'flex'} flexDirection={'column'}>
                          {due_date.split(' ').map((value, index) => {
                            return (
                              <Typography
                                key={index}
                                variant="caption"
                                fontSize={'small'}
                                fontWeight={index !== 2 ? 'bold' : 'normal'}
                                lineHeight={1.2}
                              >
                                {value}
                              </Typography>
                            );
                          })}
                        </Box>
                        <Box sx={{position: 'relative'}}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              onChange={(date) => {
                                if (date) {
                                  const payload = {
                                    path: `${itinerary.id}`,
                                    data: {
                                      due_date: date?.format('YYYY-MM-DD'),
                                    },
                                  };
                                  updateItinerary.mutate(payload);
                                }
                              }}
                              sx={{
                                '& .MuiInputBase-root, .MuiOutlinedInput-input': {
                                  display: 'none',
                                  width: '90px',
                                  height: '80px',
                                },
                              }}
                              slotProps={{
                                inputAdornment: {
                                  sx: {
                                    display: 'flex',
                                    justifyContent: 'end',
                                    width: '125px',
                                    height: '80px',
                                    maxHeight: '80px',
                                    m: 0,
                                    '& .MuiIconButton-root, .MuiSvgIcon-root': {
                                      width: '125px',
                                      height: '80px',
                                      borderRadius: 0,
                                    },
                                  },
                                },
                                textField: {
                                  sx: {
                                    justifyContent: 'flex-end',
                                    position: 'absolute',
                                    width: '90px',
                                    height: '80px',
                                    opacity: 0,
                                    left: -115,
                                    top: -35,
                                    cursor: 'pointer',
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </Box>
                      </Box>
                      <Box
                        width={'80%'}
                        p={1}
                        gap={0.5}
                        display={'flex'}
                        flexDirection={'column'}
                        onClick={(e) => {
                          if (
                            'localName' in e.target &&
                            (e.target.localName as string) !== 'path' &&
                            (e.target.localName as string) !== 'input' &&
                            (e.target.localName as string) !== 'li' &&
                            (e.target.localName as string) !== 'p'
                          )
                            setItineraryId(itinerary.id);
                          // if(e.target === 'path' || e.target === 'input')
                        }}
                      >
                        <Box display="flex" gap={0.5} flexDirection={'row'} alignItems={'center'}>
                          <Person fontSize="small" />
                          <TaskForm
                            onSubmit={() => {}}
                            defaultValues={{
                              assigned_to: itinerary.assigned_to,
                            }}
                          >
                            <TaskForm.AssignedTo
                              fullWidth={false}
                              onBlur={({target}) => {
                                if ('value' in target) {
                                  const user = users?.find(
                                    (user) => user.display_name === target.value
                                  );
                                  if (user !== undefined && itinerary.assigned_to !== user.id) {
                                    const payload = {
                                      path: `${itinerary.id}`,
                                      data: {
                                        assigned_to: user.id,
                                      },
                                    };
                                    updateItinerary.mutate(payload);
                                  }
                                }
                              }}
                              slotProps={{
                                popupIndicator: {
                                  sx: {
                                    py: 0,
                                  },
                                },
                                clearIndicator: {
                                  sx: {
                                    py: 0,
                                  },
                                },
                              }}
                              textFieldsProps={{
                                placeholder: 'Ansvarlig',
                                label: '',
                                sx: {
                                  fontSize: 'small',
                                  color: 'white',
                                  width: 150,
                                  margin: 0,
                                  '& .MuiOutlinedInput-root, .MuiAutocomplete-popupIndicator, .MuiAutocomplete-clearIndicator':
                                    {
                                      fontSize: 'small',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: 2.5,
                                      borderColor: 'white',
                                      '& > fieldset': {
                                        color: 'white',
                                        borderColor: 'white',
                                      },
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        color: 'white',
                                        borderColor: 'white',
                                      },
                                      padding: '0px !important',
                                    },
                                },
                              }}
                            />
                          </TaskForm>
                        </Box>
                        {Array.from(loc_ids).map((loc_id) => {
                          return (
                            <Box
                              key={loc_id}
                              display="flex"
                              gap={1}
                              alignItems={'center'}
                              flexWrap={'wrap'}
                              flexDirection={'row'}
                            >
                              <Box display="flex" gap={0.5} flexDirection={'row'}>
                                <AssignmentOutlinedIcon fontSize="small" />
                                <Typography variant="caption">
                                  {grouped_location_tasks?.[loc_id].length}
                                  {grouped_location_tasks?.[loc_id].length === 1
                                    ? ' Opgave,'
                                    : ' Opgaver,'}
                                </Typography>
                              </Box>
                              <Typography variant="caption" lineHeight={1.25} alignSelf={'center'}>
                                {grouped_location_tasks?.[loc_id][0].location_name}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  </Card>
                );
              }}
            </Droppable>
          );
        })}
      </Box>
    </Box>
  );
};

export default TaskItiniaries;
