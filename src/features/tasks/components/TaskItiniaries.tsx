import {
  Autocomplete,
  Box,
  Grid,
  MenuItem,
  Select,
  Typography,
  TextField,
  Card,
  CardContent,
} from '@mui/material';
import React, {useState} from 'react';
import {Person} from '@mui/icons-material';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';

import Button from '~/components/Button';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

import {useTaskItinerary} from '../api/useTaskItinerary';

import CreateItineraryDialog from './CreateItineraryDialog';
import Droppable from './Droppable';
import TaskItineraryCard from './TaskItiniaryCard';
import OwnDatePicker from '~/components/OwnDatePicker';
import moment from 'moment';
import {useTasks} from '../api/useTasks';
import {Task} from '../types';

const TaskItiniaries = () => {
  const [ids, setIds] = React.useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const {selectedLocIds, tasks} = useTaskStore();
  const [locIds, setLocIds] = React.useState<number[]>([]);
  const {taskManagementSearch} = useNavigationFunctions();
  const {
    get: {data},
  } = useTaskItinerary();

  const {
    getUsers: {data: users},
  } = useTasks();

  return (
    <Box>
      <Card elevation={2} sx={{p: 1, mb: 1}}>
        <Box display="flex" flexWrap={'wrap'} gap={1} flexDirection={'column'}>
          <Typography variant="body2" fontWeight={'bold'}>
            Filter efter:
          </Typography>
          <Box display="flex" gap={1} alignItems={'center'} flexWrap={'wrap'} flexDirection={'row'}>
            <Select size="small" sx={{fontSize: 'small', width: '48%'}} defaultValue={1}>
              <MenuItem sx={{fontSize: 'small'}} value={1}>
                Sorter efter nyeste
              </MenuItem>
            </Select>
            <Select size="small" sx={{fontSize: 'small', width: '48%'}} defaultValue={1}>
              <MenuItem sx={{fontSize: 'small'}} value={1}>
                Vis alle ture
              </MenuItem>
            </Select>
            <OwnDatePicker
              size="small"
              sx={{fontSize: 'small', width: '48%'}}
              label={'Fra'}
              margin="none"
              value={moment()}
              onChange={() => console.log('logging date')}
            />
            <Autocomplete
              size="small"
              sx={{fontSize: 'small', width: '48%'}}
              options={['indtast navn']}
              value={'indtast navn'}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
          </Box>
        </Box>
      </Card>

      <Box display="flex" gap={1} p={0.5} flexDirection={'column'}>
        {data?.map((itinerary) => {
          const itinerary_tasks = tasks?.filter((task) => task.itinerary_id === itinerary.id);
          const loc_ids = new Set(itinerary_tasks?.map((task) => task.loc_id));
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

          return (
            <Card key={itinerary.id} sx={{borderRadius: 2.5}}>
              <Box display="flex" gap={1} flexDirection={'row'}>
                <Box
                  display={'flex'}
                  width={'20%'}
                  color={'white'}
                  alignItems={'center'}
                  justifyContent={'center'}
                  sx={{backgroundColor: 'primary.main'}}
                >
                  {itinerary.due_date}
                </Box>
                <Box width={'80%'}>
                  <Box display="flex" gap={1} flexDirection={'row'}>
                    <Person fontSize="small" />
                    <Typography variant="caption" fontSize={'small'}>
                      {users?.find((user) => user.id === itinerary.assigned_to)?.display_name}
                    </Typography>
                  </Box>
                  {Array.from(loc_ids).map((loc_id) => {
                    return (
                      <Box
                        key={loc_id}
                        display="flex"
                        gap={1}
                        flexWrap={'wrap'}
                        flexDirection={'row'}
                      >
                        <Box display="flex" alignItems={'center'} gap={1} flexDirection={'row'}>
                          <AssignmentOutlinedIcon fontSize="small" />
                          <Typography variant="caption" fontSize={'small'}>
                            {grouped_location_tasks?.[loc_id].length}
                            {grouped_location_tasks?.[loc_id].length === 1 ? ' opgave' : ' opgaver'}
                          </Typography>
                        </Box>
                        <Typography variant="caption" fontSize={'small'}>
                          {grouped_location_tasks?.[loc_id][0].location_name}
                        </Typography>
                      </Box>
                    );
                  })}
                  {/* <Box display="flex" gap={1} flexDirection={'row'}>
                    <AssignmentOutlinedIcon />
                    <Typography variant="caption" fontSize={'small'}>
                      {tasks?.filter((task) => task.itinerary_id === itinerary.id).length} opgaver
                    </Typography>
                    <Typography variant="caption" fontSize={'small'}>
                      {itinerary.description}
                    </Typography>
                  </Box> */}
                </Box>
              </Box>
            </Card>
          );
        })}
      </Box>

      {/* <Grid container gap={1} spacing={2} display={'flex'} flexDirection={'row'}>
        <Grid item mobile={12} tablet={3} laptop={2.5} ml={0.5}>
          <Droppable<{loc_id: number}>
            onDrop={(e, data) => {
              e.preventDefault();
              console.log('DROP');
              console.log(data);

              if (tasks)
                setIds(
                  Array.from(
                    new Set([
                      ...ids,
                      ...tasks.filter((task) => task.loc_id === data.loc_id).map((task) => task.id),
                    ])
                  )
                );
              setLocIds([...locIds, data.loc_id]);
            }}
          >
            {({isDraggingOver}) => (
              <Box
                onClick={() => {
                  setDialogOpen(ids.length > 0 || selectedLocIds.length > 0);
                }}
                sx={{
                  width: '125px',
                  height: '100px',
                  textAlign: 'center',
                  justifyContent: 'center',
                  alignContent: 'center',
                  borderRadius: 2,
                  boxShadow: 8,
                  backgroundColor:
                    selectedLocIds.length > 0 && ids.length == 0
                      ? '#EEEEEE'
                      : isDraggingOver
                        ? 'secondary.light'
                        : 'primary.light',
                  color: 'primary.contrastText',
                  cursor: selectedLocIds.length > 0 && ids.length == 0 ? 'cursor' : 'pointer',
                }}
              >
                <Typography variant="h5" component="div">
                  Ny tur
                </Typography>
                {locIds.map((id) => (
                  <Typography key={id} variant="body2" color="text.secondary">
                    {id}
                  </Typography>
                ))}
              </Box>
            )}
          </Droppable>
        </Grid>
        <Grid item mobile={12} tablet={10} laptop={9.3} gap={1} container>
          {data?.map((itinerary) => <TaskItineraryCard key={itinerary.id} itinerary={itinerary} />)}
        </Grid>
      </Grid>
      {dialogOpen && (
        <CreateItineraryDialog ids={ids} dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />
      )} */}
    </Box>
  );
};

export default TaskItiniaries;
