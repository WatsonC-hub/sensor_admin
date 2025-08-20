import {ExpandLess, ExpandMore, Person} from '@mui/icons-material';
import {Box, Typography, Card, IconButton} from '@mui/material';
import React, {useState} from 'react';
import {LocationTasks, TaskCollection} from '~/types';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import TaskForm from '~/features/tasks/components/TaskForm';
import {useTasks} from '~/features/tasks/api/useTasks';
import DeleteIcon from '@mui/icons-material/Delete';
import {useDisplayState} from '~/hooks/ui';

type TripTaskCardListProps = {
  data: TaskCollection | undefined;
};

const TripTaskCardList = ({data}: TripTaskCardListProps) => {
  const {
    getStatus: {data: taskStatus},
    patch: patchTaskStatus,
    deleteTaskFromItinerary,
  } = useTasks();

  const {itinerary_id} = useDisplayState((state) => state);

  const [locationClicked, setLocationClicked] = useState<number | undefined>(undefined);
  const grouped_data = data?.tasks?.reduce(
    (
      acc: Record<
        string,
        {Tasks: Array<LocationTasks>; contactMobile: string; loc_name: string | undefined}
      >,
      task
    ) => {
      if (acc[task.loc_id] === undefined) {
        acc[task.loc_id] = {
          Tasks: data.tasks.filter((loc) => loc.loc_id === task.loc_id),
          contactMobile: data.contacts.find((contact) => contact.loc_id === task.loc_id)
            ?.telefonnummer,
          loc_name: data.tasks.find((loc) => loc.loc_id === task.loc_id)?.ts_name.split(' - ')[0],
        };
      }
      return acc;
    },
    {}
  );
  return (
    grouped_data && (
      <Box display={'flex'} flexDirection={'column'} gap={1}>
        {Object.keys(grouped_data).map((loc_id) => {
          return (
            <Box key={loc_id}>
              <Card
                sx={{
                  backgroundColor: '#B87333',
                  borderRadius: 2.5,
                  color: 'white',
                  m: 0.5,
                  mt: 0,
                }}
                raised
              >
                <Box
                  display={'flex'}
                  flexDirection={'row'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                  p={0.5}
                  m={0.5}
                  sx={{cursor: 'pointer'}}
                  onClick={() => {
                    if (!locationClicked) setLocationClicked(parseInt(loc_id));
                    else if (locationClicked === parseInt(loc_id)) setLocationClicked(undefined);
                    else setLocationClicked(parseInt(loc_id));
                  }}
                >
                  <Box display={'flex'} flexDirection={'row'} gap={0.5} alignItems={'center'}>
                    {locationClicked && locationClicked === parseInt(loc_id) ? (
                      <ExpandLess fontSize="small" />
                    ) : (
                      <ExpandMore fontSize="small" />
                    )}
                    <Box display={'flex'} flexDirection={'column'} gap={0.5}>
                      {grouped_data[loc_id].loc_name}
                      {grouped_data[loc_id].contactMobile && (
                        <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
                          <Person fontSize="small" />
                          {grouped_data[loc_id].contactMobile.includes('+45') ||
                          (grouped_data[loc_id].contactMobile.includes('45') &&
                            grouped_data[loc_id].contactMobile.trim().length === 10)
                            ? '+45 ' + grouped_data[loc_id].contactMobile.split('45')[1]
                            : `+45 ${grouped_data[loc_id].contactMobile}`}
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Box display={'flex'} flexDirection={'row'} gap={0.5} alignItems={'center'}>
                    <AssignmentOutlinedIcon fontSize="small" />
                    {grouped_data[loc_id].Tasks.length}
                    <Typography variant="caption">
                      {grouped_data[loc_id].Tasks.length === 1 ? 'Opgave' : 'Opgaver'}
                    </Typography>
                    <IconButton
                      onClick={() => {
                        deleteTaskFromItinerary.mutate({
                          path: `${itinerary_id}/tasks/${loc_id}`,
                        });
                      }}
                      sx={{p: 0, m: 0, color: 'white'}}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
              {locationClicked === parseInt(loc_id) && (
                <Box display={'flex'} flexDirection={'column'} gap={1}>
                  {grouped_data?.[loc_id].Tasks.map((task) => {
                    return (
                      <Card
                        key={task.id}
                        sx={{
                          borderRadius: 2.5,
                          m: 0.5,
                          ml: 1.5,
                        }}
                        raised
                      >
                        <Box
                          display={'flex'}
                          flexDirection={'row'}
                          justifyContent={'space-between'}
                          alignItems={'center'}
                          gap={1}
                          sx={{
                            borderRadius: 2.5,
                            p: 0.5,
                            m: 0.5,
                          }}
                        >
                          <Box display={'flex'} flexDirection={'column'} sx={{width: '80%'}}>
                            <Box
                              display={'flex'}
                              flexDirection={'row'}
                              alignItems={'center'}
                              gap={0.5}
                              justifySelf={'start'}
                            >
                              <AssignmentOutlinedIcon fontSize="small" />
                              <Typography variant="caption" sx={{wordBreak: 'break-all'}}>
                                {task.name}
                              </Typography>
                            </Box>
                            <Typography fontStyle={'italic'} variant="caption">
                              {task.description}
                            </Typography>
                          </Box>
                          <TaskForm onSubmit={() => {}} defaultValues={{...task}}>
                            <TaskForm.StatusSelect
                              fullWidth={false}
                              onBlurCallback={(event) => {
                                if (typeof event !== 'number' && 'target' in event) {
                                  const status = taskStatus?.find(
                                    (status) => status.id === parseInt(event.target.value)
                                  );
                                  if (status !== undefined && task.status_id !== status.id) {
                                    const payload = {
                                      path: `${task.id}`,
                                      data: {
                                        status_id: status.id,
                                      },
                                    };
                                    patchTaskStatus.mutate(payload);
                                  }
                                }
                              }}
                              label={''}
                              sx={{
                                p: 0,
                                m: 0,
                                width: 120,
                                '& .MuiSelect-outlined, .MuiOutlinedInput-root, .MuiOutlinedInput-root, &:hover .MuiOutlinedInput-notchedOutline':
                                  {
                                    borderColor: 'primary.main',
                                    fontSize: 'small',
                                    borderRadius: 2.5,
                                    py: 0.2,
                                  },
                                '& .Mui-focused': {
                                  borderColor: 'primary.main',
                                  '& > fieldset': {borderColor: 'primary.main'},
                                },
                                '& .MuiSelect-icon': {
                                  color: 'primary.main',
                                },
                                '& .MuiOutlinedInput-root': {
                                  '& > fieldset': {borderColor: 'primary.main'},
                                },
                                '& .MuiInputLabel-root': {
                                  borderColor: 'primary.main',
                                  color: 'primary.main',
                                  fontSize: 'small',
                                  backgroundColor: 'white',
                                  transform: 'translate(10px, -9px) scale(0.9)',
                                },
                              }}
                            />
                          </TaskForm>
                        </Box>
                      </Card>
                    );
                  })}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    )
  );
};

export default TripTaskCardList;
