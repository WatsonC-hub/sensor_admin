import {Box, Typography, Card, IconButton, Link} from '@mui/material';
import React, {ReactNode, useRef, useState} from 'react';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

import {useTaskState} from '~/features/tasks/api/useTaskState';

import useTaskItinerary from '../api/useTaskItinerary';

import {useTasks} from '../api/useTasks';
import {Taskitinerary} from '../types';
import {convertDate} from '~/helpers/dateConverter';
import {useDisplayState} from '~/hooks/ui';
import {DatePicker} from '@mui/x-date-pickers';
import TaskForm from './TaskForm';
import {useDroppable} from '@dnd-kit/react';
import dayjs from 'dayjs';
import 'dayjs/locale/da';
import CreateItineraryDialog from './CreateItineraryDialog';
import Button from '~/components/Button';
import {useMapFilterStore} from '~/features/map/store';
import {ItineraryColors} from '~/features/notifications/consts';
import {useUser} from '~/features/auth/useUser';
import {Edit, ExpandLess, ExpandMore, Person} from '@mui/icons-material';
import TooltipWrapper from '~/components/TooltipWrapper';

const selectData = (data: Taskitinerary[], user_id: number | undefined) => {
  const reduced = data.reduce(
    (acc: Record<string, Taskitinerary[]>, itinerary: Taskitinerary) => {
      if (itinerary.assigned_to === user_id) {
        if (!acc['Mine ture']) {
          acc['Mine ture'] = [];
        }
        acc['Mine ture'].push(itinerary);
        return acc;
      }

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
};

function Droppable({id, children, color}: {id: string; children: ReactNode; color?: string}) {
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
        background: !isDropTarget
          ? `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), ${color}`
          : 'linear-gradient(rgba(255,255,255,0.4), rgba(255,255,255,0.4)), #FFA137',
      }}
      ref={setNodeRef}
    >
      {children}
    </Box>
  );
}

const TaskItiniaries = () => {
  const [openDialog, setOpenDialog] = useState(false);

  const user = useUser();
  const {
    get: {data},
  } = useTaskItinerary(undefined, {
    select: (itineraries) => selectData(itineraries, user?.user_id),
  });

  const [openItineraryDialog, setOpenItineraryDialog] = useState<string | undefined>(undefined);
  const [filters, setFilters] = useMapFilterStore((state) => [state.filters, state.setFilters]);
  const [expandItinerary, setExpandItinerary] = useState<Record<string, boolean>>({});
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [itinerary_id, setItineraryId, setLocId] = useDisplayState((state) => [
    state.itinerary_id,
    state.setItineraryId,
    state.setLocId,
  ]);

  const {
    getUsers: {data: users},
  } = useTasks();
  const {tasks} = useTaskState();
  const {patch: updateItinerary} = useTaskItinerary();

  return (
    <Box display="flex" maxHeight={'100%'} gap={1} flexDirection={'column'}>
      <Typography variant="h6" sx={{padding: 1}}>
        Ture
      </Typography>
      <Box sx={{overflowY: 'auto', overflowX: 'hidden'}}>
        <Box px={1}>
          <TooltipWrapper
            description="Læs mere om ture i vores dokumentation for at få et bedre overblik over hvordan du kan bruge ture i Field appen"
            url="https://watsonc.dk/guides/opgavestyring/#serviceture"
          >
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
          </TooltipWrapper>
        </Box>
        {data && (
          <Box pb={0.5}>
            {Object.entries(data).map(([month, itineraries]) => {
              return (
                <Box key={month} display="flex" flexDirection={'column'} gap={1}>
                  <Typography px={0.5} pt={1} variant="body2" fontWeight={'bold'}>
                    {month}
                  </Typography>
                  {itineraries.map((itinerary) => {
                    const itinerary_tasks = tasks?.filter(
                      (task) => task.itinerary_id === itinerary.id
                    );

                    const loc_ids = [...new Set(itinerary_tasks?.map((task) => task.loc_id))];

                    const locations = loc_ids
                      .map((loc_id) => ({
                        loc_id,
                        loc_name:
                          itinerary_tasks?.find((task) => task.loc_id === loc_id)?.location_name ??
                          '',
                      }))
                      .sort((a, b) =>
                        a.loc_name.localeCompare(b.loc_name, 'da', {sensitivity: 'base'})
                      );

                    let color = undefined;

                    if (filters?.itineraries?.map((SI) => SI.id).includes(itinerary.id)) {
                      const index = filters.itineraries.findIndex((SI) => SI.id === itinerary.id);
                      color = ItineraryColors[index];
                    }

                    const due_date = itinerary.due_date
                      ? convertDate(itinerary.due_date)
                      : 'Ingen dato';

                    const expanded = expandItinerary?.[itinerary.id] ?? true;

                    return (
                      <Card
                        key={itinerary.id}
                        sx={{
                          borderRadius: 2.5,
                          mx: 1,
                          outlineWidth: '2px',
                          outlineStyle: 'solid',
                          outlineColor:
                            itinerary_id === itinerary.id
                              ? `oklch(70.8% 0.243 264.376)`
                              : 'transparent',
                        }}
                      >
                        <Droppable id={itinerary.id} color={color}>
                          <Box display={'flex'} flexDirection={'column'} width={'100%'}>
                            <Box
                              color={'white'}
                              display={'flex'}
                              flexDirection={'row'}
                              alignItems={'center'}
                              py={0.5}
                              pr={1}
                              justifyContent={'space-between'}
                              sx={{
                                backgroundColor: color ? color : 'primary.main',
                              }}
                            >
                              <Box
                                display={'flex'}
                                flexDirection={'column'}
                                maxWidth={'70%'}
                                gap={0.5}
                              >
                                <Box display={'flex'} flexDirection={'row'}>
                                  <Typography
                                    pl={1.5}
                                    sx={{
                                      textOverflow: 'ellipsis',
                                      overflow: 'hidden',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    <Link
                                      sx={{
                                        cursor: 'pointer',
                                        textDecorationColor: 'rgba(255, 255, 255, 0.5)',
                                      }}
                                      onClick={() => setItineraryId(itinerary.id)}
                                      underline="always"
                                      color="inherit"
                                    >
                                      {itinerary.name}
                                    </Link>
                                  </Typography>
                                </Box>
                                <Box
                                  display={'flex'}
                                  flexDirection={'row'}
                                  alignItems={'center'}
                                  gap={0.5}
                                  pl={1}
                                >
                                  <TaskForm
                                    onSubmit={() => {}}
                                    defaultValues={{
                                      assigned_to: itinerary.assigned_to,
                                    }}
                                  >
                                    <Person fontSize="small" />
                                    <TaskForm.AssignedTo
                                      fullWidth={false}
                                      onBlur={({target}) => {
                                        if ('value' in target) {
                                          const user = users?.find(
                                            (user) => user.display_name === target.value
                                          );
                                          if (
                                            user !== undefined &&
                                            itinerary.assigned_to !== user.id
                                          ) {
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
                                      textFieldsProps={{
                                        placeholder: 'Ansvarlig',
                                        label: '',
                                        sx: {
                                          fontSize: 'small',
                                          width: 175,
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
                                                borderColor: 'white',
                                              },
                                              padding: '0px !important',
                                            },
                                        },
                                      }}
                                    />
                                  </TaskForm>
                                </Box>
                              </Box>
                              <Box
                                display={'flex'}
                                flexDirection={'column'}
                                alignItems={'end'}
                                gap={0.5}
                              >
                                <Box
                                  display={'flex'}
                                  flexDirection={'row'}
                                  gap={0.3}
                                  alignItems={'center'}
                                >
                                  <Typography
                                    variant="caption"
                                    fontSize={'small'}
                                    sx={{cursor: 'default'}}
                                  >
                                    {due_date}
                                  </Typography>

                                  <DatePicker
                                    key={itinerary.id}
                                    onChange={(date) => {
                                      if (date) {
                                        const payload = {
                                          path: `${itinerary.id}`,
                                          data: {
                                            due_date: date?.format('YYYY-MM-DD'),
                                          },
                                        };
                                        updateItinerary.mutate(payload, {
                                          onSuccess: () => {
                                            setOpenItineraryDialog(undefined);
                                          },
                                        });
                                      }
                                    }}
                                    open={openItineraryDialog === itinerary.id}
                                    onClose={() => setOpenItineraryDialog(undefined)}
                                    slots={{
                                      field: () => null,
                                    }}
                                    slotProps={{
                                      popper: {
                                        anchorEl: () => buttonRef.current ?? document.body,
                                        placement: 'bottom-start',
                                        disablePortal: true,
                                      },
                                    }}
                                  />
                                  <IconButton
                                    ref={openItineraryDialog === itinerary.id ? buttonRef : null}
                                    onClick={() => setOpenItineraryDialog(itinerary.id)}
                                    sx={{p: 0}}
                                  >
                                    <Edit sx={{color: 'white'}} fontSize="small" />
                                  </IconButton>
                                </Box>
                                <Box display="flex" flexDirection={'row'} gap={0.5}>
                                  <Typography variant="caption">Fremhæv</Typography>
                                  <IconButton
                                    sx={{p: 0}}
                                    onClick={() => {
                                      if (
                                        filters?.itineraries
                                          ?.map((SI) => SI.id)
                                          .includes(itinerary.id)
                                      ) {
                                        setFilters({
                                          ...filters,
                                          itineraries: filters.itineraries.filter(
                                            (SI) => SI.id !== itinerary.id
                                          ),
                                        });
                                      } else {
                                        setFilters({
                                          ...filters,
                                          itineraries: [
                                            ...(filters.itineraries ?? []),
                                            {
                                              name: itinerary.name,
                                              id: itinerary.id,
                                              assigned_to_name:
                                                users?.find(
                                                  (user) => user.id === itinerary.assigned_to
                                                )?.display_name ?? '',
                                              due_date: itinerary.due_date ?? '',
                                            },
                                          ],
                                        });
                                      }
                                    }}
                                  >
                                    {filters?.itineraries
                                      ?.map((SI) => SI.id)
                                      .includes(itinerary.id) ? (
                                      <VisibilityOffIcon sx={{color: 'white'}} fontSize="small" />
                                    ) : (
                                      <VisibilityIcon sx={{color: 'white'}} fontSize="small" />
                                    )}
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                            <Box
                              px={1}
                              py={1}
                              gap={0.5}
                              display={'flex'}
                              flexDirection={'column'}
                              justifyContent={'center'}
                            >
                              <Box
                                display="flex"
                                gap={0.5}
                                flexDirection={'row'}
                                alignItems={'start'}
                                justifyContent={'space-between'}
                              >
                                <Box display="flex" gap={0.5} flexDirection={'column'}>
                                  {expanded
                                    ? locations.map((location) => {
                                        return (
                                          <Box
                                            key={location.loc_id}
                                            display="flex"
                                            gap={1}
                                            alignItems={'center'}
                                            flexWrap={'wrap'}
                                            flexDirection={'row'}
                                          >
                                            <Box display="flex" gap={0.5} flexDirection={'row'}>
                                              <Typography fontSize={'small'} width={'fit-content'}>
                                                <Link
                                                  sx={{cursor: 'pointer'}}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setLocId(location.loc_id);
                                                  }}
                                                >
                                                  {location.loc_name}
                                                </Link>
                                              </Typography>
                                            </Box>
                                          </Box>
                                        );
                                      })
                                    : null}
                                </Box>
                                {expanded ? (
                                  <ExpandLess
                                    sx={{cursor: 'pointer'}}
                                    onClick={() => {
                                      setExpandItinerary((prev) => ({
                                        ...prev,
                                        [itinerary.id]: false,
                                      }));
                                    }}
                                  />
                                ) : (
                                  <ExpandMore
                                    sx={{cursor: 'pointer'}}
                                    onClick={() => {
                                      setExpandItinerary((prev) => ({
                                        ...prev,
                                        [itinerary.id]: true,
                                      }));
                                    }}
                                  />
                                )}
                              </Box>
                              <Typography fontSize={'small'} width={'fit-content'}>
                                Der er {itinerary_tasks?.length ?? 0} opgaver på denne tur.
                              </Typography>
                            </Box>
                          </Box>
                        </Droppable>
                      </Card>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
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
