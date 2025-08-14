import {Box, Typography, Card, IconButton, Link} from '@mui/material';
import React, {ReactNode, useState} from 'react';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

import {useTaskState} from '~/features/tasks/api/useTaskState';

import useTaskItinerary from '../api/useTaskItinerary';

import {useTasks} from '../api/useTasks';
import {Task, Taskitinerary} from '../types';
import {convertToShorthandDate} from '~/helpers/dateConverter';
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
import {Edit, ExpandLess, ExpandMore} from '@mui/icons-material';
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

  const user = useUser();
  const {
    get: {data},
  } = useTaskItinerary(undefined, {
    select: (itineraries) => selectData(itineraries, user?.user_id),
  });

  const [filters, setFilters] = useMapFilterStore((state) => [state.filters, state.setFilters]);
  const [expandItinerary, setExpandItinerary] = useState<Record<string, boolean>>({});
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
    <Box display="flex" maxHeight={'100%'} gap={1} flexDirection={'column'} overflow={'auto'}>
      <Typography variant="h6" sx={{padding: 1}}>
        Ture
      </Typography>
      <Box px={1}>
        <TooltipWrapper
          description="Læs mere om ture i vores dokumentation for at få et bedre overblik over hvordan du kan bruge ture i Field appen"
          url="https://watsonc.dk/guides/field#ture"
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

                  let color = undefined;

                  if (filters?.itineraries?.map((SI) => SI.id).includes(itinerary.id)) {
                    const index = filters.itineraries.findIndex((SI) => SI.id === itinerary.id);
                    color = ItineraryColors[index];
                  }

                  const due_date = itinerary.due_date
                    ? convertToShorthandDate(itinerary.due_date)
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
                        <Box
                          component="span"
                          display={'flex'}
                          width={'20%'}
                          color={'white'}
                          flexDirection={'row'}
                          alignItems={'center'}
                          justifyContent={'center'}
                          sx={{backgroundColor: color ? color : 'primary.main'}}
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
                          <Box
                            display={'flex'}
                            component={'span'}
                            alignItems={'center'}
                            sx={{position: 'relative'}}
                          >
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
                                  updateItinerary.mutate(payload);
                                }
                              }}
                              sx={{
                                '& .MuiIconButton-root, .MuiSvgIcon-root': {
                                  width: '125px',
                                  height: '80px',
                                  borderRadius: 0,
                                },
                                '& .MuiInputBase-root, .MuiOutlinedInput-input': {
                                  display: 'none',
                                },
                              }}
                              slotProps={{
                                inputAdornment: {
                                  sx: {
                                    display: 'flex',
                                    justifyContent: 'end',
                                    width: '100% !important',
                                    height: '80px',
                                    maxHeight: '80px',
                                    '& .MuiButtonBase-root': {
                                      width: '100% !important',
                                      height: '80px',
                                    },
                                    m: 0,
                                  },
                                },
                                textField: {
                                  slotProps: {
                                    input: {
                                      sx: {
                                        display: 'none',
                                      },
                                    },
                                  },
                                  sx: {
                                    justifyContent: 'flex-end',
                                    position: 'absolute',
                                    height: '60px',
                                    opacity: 0,
                                    left: -15,
                                    top: -15,
                                    cursor: 'pointer',
                                  },
                                },
                              }}
                            />
                            <Edit fontSize="small" sx={{ml: 0.5}} />
                          </Box>
                        </Box>
                        <Box
                          width={'70%'}
                          px={1}
                          pb={1}
                          gap={0.5}
                          display={'flex'}
                          flexDirection={'column'}
                          justifyContent={'center'}
                          onClick={(e) => {
                            if (
                              'localName' in e.target &&
                              (e.target.localName as string) !== 'path' &&
                              (e.target.localName as string) !== 'input' &&
                              (e.target.localName as string) !== 'li' &&
                              (e.target.localName as string) !== 'p' &&
                              (e.target.localName as string) !== 'span' &&
                              (e.target.localName as string) !== 'svg'
                            )
                              setItineraryId(itinerary.id);
                          }}
                        >
                          <Typography
                            fontSize={'small'}
                            fontWeight={'bold'}
                            sx={{
                              alignSelf: 'flex-start',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              pt: 0.8,
                              pb: 0.4,
                              minWidth: 0,
                            }}
                          >
                            {itinerary.name}
                          </Typography>
                          <Box display="flex" gap={0.5} flexDirection={'row'} alignItems={'center'}>
                            {/* <Person fontSize="small" /> */}
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
                                    width: 150,
                                    margin: 0,
                                    '& .MuiOutlinedInput-root, .MuiAutocomplete-popupIndicator, .MuiAutocomplete-clearIndicator':
                                      {
                                        fontSize: 'small',
                                        border: 'none',
                                        borderRadius: 2.5,
                                        borderColor: 'grey.700',
                                        '& > fieldset': {
                                          color: 'white',
                                          borderColor: 'grey.700',
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                          color: 'white ',
                                          borderColor: 'grey.700',
                                        },
                                        padding: '0px !important',
                                      },
                                  },
                                }}
                              />
                            </TaskForm>
                          </Box>
                          <Box
                            display="flex"
                            gap={0.5}
                            flexDirection={'row'}
                            alignItems={'start'}
                            justifyContent={'space-between'}
                          >
                            <Box display="flex" gap={0.5} flexDirection={'column'}>
                              {expanded
                                ? loc_ids.map((loc_id) => {
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
                                          <Typography fontSize={'small'} width={'fit-content'}>
                                            <Link
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setLocId(loc_id);
                                              }}
                                            >
                                              {grouped_location_tasks?.[loc_id][0].location_name}
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
                                onClick={() => {
                                  setExpandItinerary((prev) => ({
                                    ...prev,
                                    [itinerary.id]: false,
                                  }));
                                }}
                              />
                            ) : (
                              <ExpandMore
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
                        <Box
                          width={'10%'}
                          display={'flex'}
                          flexDirection={'row'}
                          alignItems={'center'}
                        >
                          <IconButton
                            sx={{
                              color: 'primary.contrastText',
                            }}
                            onClick={() => {
                              if (filters?.itineraries?.map((SI) => SI.id).includes(itinerary.id)) {
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
                                        users?.find((user) => user.id === itinerary.assigned_to)
                                          ?.display_name ?? '',
                                      due_date: itinerary.due_date ?? '',
                                    },
                                  ],
                                });
                              }
                            }}
                          >
                            {filters?.itineraries?.map((SI) => SI.id).includes(itinerary.id) ? (
                              <VisibilityOffIcon sx={{color: 'primary.main'}} />
                            ) : (
                              <VisibilityIcon sx={{color: 'primary.main'}} />
                            )}
                          </IconButton>
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
