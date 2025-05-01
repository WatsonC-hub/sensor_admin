import {Box, Typography, Card} from '@mui/material';
import React, {ReactNode, useState} from 'react';
import {Person} from '@mui/icons-material';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';

import {useTaskStore} from '~/features/tasks/api/useTaskStore';

import {useTaskItinerary} from '../api/useTaskItinerary';

import {useTasks} from '../api/useTasks';
import {Task, Taskitinerary} from '../types';
import {convertToShorthandDate} from '~/helpers/dateConverter';
import {useDisplayState} from '~/hooks/ui';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import TaskForm from './TaskForm';
import {useDroppable} from '@dnd-kit/react';
import moment from 'moment';
import dayjs from 'dayjs';
import CreateItineraryDialog from './CreateItineraryDialog';
import Button from '~/components/Button';

export function Droppable({id, children}: {id: string; children: ReactNode}) {
  const {isDropTarget, ref: setNodeRef} = useDroppable({
    id: id,
    data: {itinerary_id: id},
  });

  return (
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
        backgroundColor: !isDropTarget ? 'primary.light' : 'secondary.light',
        color: 'primary.contrastText',
        cursor: 'pointer',
      }}
      ref={setNodeRef}
    >
      {children}
    </Box>
  );
}

const TaskItiniaries = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const {
    get: {data},
  } = useTaskItinerary(undefined, {
    select: (data) => {
      const reduced = data
        .sort((a, b) => (moment(a.due_date).isAfter(moment(b.due_date)) ? 1 : -1))
        .reduce(
          (acc: Record<string, Taskitinerary[]>, itinerary: Taskitinerary) => {
            const date = dayjs(itinerary.due_date).format('MMMM YYYY');
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(itinerary);
            return acc;
          },
          {} as Record<string, Taskitinerary[]>
        );
      return reduced;
    },
  });

  const setItineraryId = useDisplayState((state) => state.setItineraryId);
  const {
    getUsers: {data: users},
  } = useTasks();
  const {tasks} = useTaskStore();
  const {patch: updateItinerary} = useTaskItinerary();

  return (
    <Box display="flex" maxHeight={'100%'} gap={1} mt={4} p={0.5} flexDirection={'column'}>
      <Button
        bttype="primary"
        onClick={() => {
          setOpenDialog(true);
        }}
        sx={{
          width: '100%',
          height: 40,
          borderRadius: 2.5,
          fontSize: 'small',
          fontWeight: 'bold',
        }}
      >
        Opret ny tur
      </Button>
      {data &&
        Object.entries(data).map(([month, itineraries]) => {
          return (
            <Box key={month} display="flex" flexDirection={'column'} gap={1}>
              <Typography px={0.5} variant="body2" fontWeight={'bold'}>
                {month}
              </Typography>
              {itineraries.map((itinerary) => {
                const itinerary_tasks = tasks?.filter((task) => task.itinerary_id === itinerary.id);
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
                  <Card key={itinerary.id} sx={{borderRadius: 2.5, mx: 1}}>
                    <Droppable id={itinerary.id}>
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
                          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="da">
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
                                        color: 'white ',
                                        borderColor: 'white !important',
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
                    </Droppable>
                  </Card>
                );
              })}
            </Box>
          );
        })}
      <CreateItineraryDialog
        dialogOpen={openDialog}
        setDialogOpen={() => {
          setOpenDialog(false);
        }}
      />
    </Box>
  );
};

export default TaskItiniaries;
