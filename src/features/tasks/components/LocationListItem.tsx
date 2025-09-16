import {Box, Grid2, Link, Typography} from '@mui/material';
import React from 'react';
import {MapOverview} from '~/hooks/query/useNotificationOverview';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import {useTaskState} from '../api/useTaskState';
import {convertDate} from '~/helpers/dateConverter';
import {CalendarIcon} from '@mui/x-date-pickers';
import {Person} from '@mui/icons-material';
import useTaskItinerary from '../api/useTaskItinerary';
import {getIcon} from '~/features/notifications/utils';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {useDraggable} from '@dnd-kit/react';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useUser} from '~/features/auth/useUser';
import {useDisplayState} from '~/hooks/ui';
type Props = {
  itemData: MapOverview;
  onClick: () => void;
};

const LocationListItem = ({itemData, onClick}: Props) => {
  const user = useUser();
  const {tasks} = useTaskState();
  const setSelectedTask = useDisplayState((state) => state.setSelectedTask);
  const {isMobile} = useBreakpoints();
  const {handleRef, ref} = useDraggable({
    id: itemData.loc_id,
    data: {loc_id: itemData.loc_id},
    feedback: 'clone',
  });

  const TripIcon = getIcon(
    {
      has_task: true,
      itinerary_id: itemData.itinerary_id,
      notification_id: null,
    },
    false
  );

  const filteredTasks = tasks?.filter((task) => task.loc_id === itemData.loc_id);

  const {
    getItinerary: {data: itinerary},
  } = useTaskItinerary(itemData.itinerary_id);

  return (
    <Box
      display={'flex'}
      flexDirection={'row'}
      alignItems={'center'}
      ref={ref}
      width={'100%'}
      sx={{
        ':hover': {
          backgroundColor: 'grey.100',
        },
      }}
    >
      {!isMobile && user?.advancedTaskPermission && (
        <Box display="flex" flexDirection={'row'} alignItems={'center'} alignSelf={'center'}>
          <DragIndicatorIcon ref={handleRef} sx={{cursor: 'grab'}} fontSize="small" />
        </Box>
      )}
      <Box
        display={'flex'}
        flexDirection={'column'}
        flexGrow={1}
        sx={{
          py: 0.5,
          px: 1,
          cursor: 'pointer',
        }}
        onClick={onClick}
      >
        <Box
          display={'flex'}
          flexDirection={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <Typography>{itemData.loc_name}</Typography>
          {itinerary && (
            <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={1}>
              <Box
                height={24}
                width={24}
                sx={{
                  color: 'grey.700',
                }}
              >
                {TripIcon}
              </Box>
              {itinerary.due_date && (
                <Typography variant="caption" color="grey.700">
                  {convertDate(itinerary.due_date)}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        <Box display={'flex'} flexDirection={'column'}>
          {filteredTasks
            ?.sort((a, b) => Number(a.is_created) - Number(b.is_created))
            .map((task) => {
              return (
                <Grid2 key={task.id} container p={1} alignItems={'center'} flexGrow={1}>
                  <Grid2 size={8} alignContent={'center'} flexGrow={1}>
                    <Box display={'flex'} flexDirection={'column'}>
                      <Link
                        display={'flex'}
                        flexDirection={'row'}
                        gap={1}
                        underline="hover"
                        sx={{
                          width: 'fit-content',
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task.id);
                        }}
                      >
                        <Box
                          display={'flex'}
                          flexDirection={'row'}
                          color={'white'}
                          gap={1}
                          alignItems={'center'}
                        >
                          <NotificationIcon
                            iconDetails={{
                              has_task: task.is_created,
                              notification_id: task.is_created
                                ? null
                                : task.blocks_notifications[0],
                              flag: task.is_created ? null : task.flag,
                              itinerary_id: task.itinerary_id,
                              due_date: task.due_date,
                            }}
                          />
                        </Box>
                        <Typography variant="body2">{task.name}</Typography>
                      </Link>
                      {task.sla && (
                        <Typography
                          mt={-0.5}
                          ml={3.5}
                          fontStyle={'italic'}
                          fontWeight={'bold'}
                          variant={'caption'}
                        >
                          SLA: {task.sla.format('l')}
                        </Typography>
                      )}
                    </Box>
                  </Grid2>
                  <Grid2 size={4} display={'flex'} flexDirection={'column'} alignItems={'start'}>
                    {task.assigned_to && (
                      <Box display={'flex'} flexDirection={'row'} gap={1} alignItems={'center'}>
                        <Person fontSize="small" sx={{color: 'grey.700', fontSize: '1.1rem'}} />
                        <Typography variant="caption" color="grey.700">
                          {task.assigned_display_name}
                        </Typography>
                      </Box>
                    )}
                    {task.due_date && (
                      <Box display={'flex'} flexDirection={'row'} gap={1}>
                        <CalendarIcon
                          fontSize="small"
                          sx={{color: 'grey.700', fontSize: '1.1rem'}}
                        />
                        <Typography
                          variant="caption"
                          alignItems={'center'}
                          fontSize={'0.65rem'}
                          color="grey.700"
                        >
                          {convertDate(task.due_date)}
                        </Typography>
                      </Box>
                    )}
                  </Grid2>
                </Grid2>
              );
            })}
        </Box>
      </Box>
    </Box>
  );
};

export default LocationListItem;
