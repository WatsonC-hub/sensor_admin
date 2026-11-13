import {useDroppable} from '@dnd-kit/react';
import AddCircleOutlined from '@mui/icons-material/AddCircleOutlined';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Edit from '@mui/icons-material/Edit';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Person from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {Box, ButtonBase, IconButton, Link, Tab, Tabs, Typography} from '@mui/material';
import {DatePicker} from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import {selectAtom} from 'jotai/utils';
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';

import Button from '~/components/Button';
import TooltipWrapper from '~/components/TooltipWrapper';
import {useUser} from '~/features/auth/useUser';
import {FlagEnum, ItineraryColors, sensorColors} from '~/features/notifications/consts';
import {useTaskUsers} from '~/features/tasks/api/useTasks';
import {useTaskState} from '~/features/tasks/api/useTaskState';

import 'dayjs/locale/da';

import CreateItineraryDialog from '~/features/tasks/components/CreateItineraryDialog';
import TaskForm from '~/features/tasks/components/TaskForm';
import {convertDate} from '~/helpers/dateConverter';
import {displayStore, useDisplayState} from '~/hooks/ui';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {expandedItinerariesAtom, highlightedItinerariesAtom, turlisteModeAtom} from '~/state/atoms';

import {useItineraries, useItineraryLinks, useItineraryMutations} from '../api/useItinerary';
import {visibleOnActiveTur} from '../helpers';
import ItineraryCardLayout from './ItineraryCardLayout';
import ItineraryHistoryList from './ItineraryHistoryList';

import type {Taskitinerary} from '../types';
import type {ReactNode} from 'react';

const selectData = (data: Taskitinerary[], user_id: string | undefined) => {
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
      ref={setNodeRef}
      sx={{
        display: 'flex',
        borderRadius: 2,
        boxShadow: 8,

        background: !isDropTarget
          ? `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), ${color}`
          : 'linear-gradient(rgba(255,255,255,0.4), rgba(255,255,255,0.4)), #FFA137',
      }}
    >
      {children}
    </Box>
  );
}

let lastScrollTop = 0;

let wasTripListOpen = displayStore.getState().trip_list;
displayStore.subscribe((state) => {
  if (wasTripListOpen && !state.trip_list) {
    lastScrollTop = 0;
  }
  wasTripListOpen = state.trip_list;
});

type ItineraryCardProps = {
  itinerary: Taskitinerary;
  selected: boolean;
  taskCount: number;
};

// Each card subscribes only to its own expanded/highlight state, so toggling one tur
// doesn't re-render the rest of the list.
const ItineraryCard = memo(function ItineraryCard({
  itinerary,
  selected,
  taskCount,
}: ItineraryCardProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  // The ansvarlig dropdown and the date picker are only mounted while in use: a form, an
  // autocomplete and a date picker on every card made the list slow to mount.
  const [editingAnsvarlig, setEditingAnsvarlig] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const expanded = useAtomValue(
    useMemo(
      () => selectAtom(expandedItinerariesAtom, (expanded) => expanded[itinerary.id] ?? false),
      [itinerary.id]
    )
  );
  const setExpandItinerary = useSetAtom(expandedItinerariesAtom);

  // Only fetch the lokationer while the card is expanded.
  const {data: links} = useItineraryLinks(expanded ? itinerary.id : null);
  const locations = useMemo(() => (links ? visibleOnActiveTur(links) : undefined), [links]);

  const highlightIndex = useAtomValue(
    useMemo(
      () => selectAtom(highlightedItinerariesAtom, (ids) => ids.indexOf(itinerary.id)),
      [itinerary.id]
    )
  );
  const setHighlightedItineraries = useSetAtom(highlightedItinerariesAtom);
  const highlighted = highlightIndex !== -1;
  const color = highlighted ? ItineraryColors[highlightIndex] : undefined;

  const setItineraryId = useDisplayState((state) => state.setItineraryId);
  const {location: openLocation} = useNavigationFunctions();

  const {data: users} = useTaskUsers();
  const ansvarlig = users?.find((user) => user.id === itinerary.assigned_to)?.display_name;
  const {patch: updateItinerary} = useItineraryMutations();

  const due_date = itinerary.due_date ? convertDate(itinerary.due_date) : 'Ingen dato';

  return (
    <ItineraryCardLayout
      name={itinerary.name}
      selected={selected}
      onOpen={() => setItineraryId(itinerary.id)}
      headerColor={
        color
          ? color
          : dayjs(itinerary.due_date).isBefore(dayjs().toDate(), 'day')
            ? sensorColors[FlagEnum.WARNING].color
            : 'primary.main'
      }
      frame={(content) => (
        <Droppable id={itinerary.id} color={color}>
          {content}
        </Droppable>
      )}
      subtitle={
        editingAnsvarlig ? (
          <TaskForm onSubmit={() => {}} defaultValues={{assigned_to: itinerary.assigned_to}}>
            <Person fontSize="small" />
            <TaskForm.AssignedTo
              fullWidth={false}
              openOnFocus
              onBlur={({target}) => {
                if ('value' in target) {
                  const user = users?.find((user) => user.display_name === target.value);
                  if (user !== undefined && itinerary.assigned_to !== user.id) {
                    updateItinerary.mutate({path: `${itinerary.id}`, data: {assigned_to: user.id}});
                  }
                }
                setEditingAnsvarlig(false);
              }}
              textFieldsProps={{
                autoFocus: true,
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
        ) : (
          <ButtonBase
            onClick={() => setEditingAnsvarlig(true)}
            aria-label="Skift ansvarlig"
            sx={{gap: 0.5, borderRadius: 1, minWidth: 0, justifyContent: 'start'}}
          >
            <Person fontSize="small" />
            <Typography
              sx={{
                fontSize: 'small',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textDecoration: 'underline',
                textDecorationColor: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              {ansvarlig ?? 'Vælg ansvarlig'}
            </Typography>
          </ButtonBase>
        )
      }
      headerRight={
        <>
          <Box sx={{display: 'flex', gap: 0.3, alignItems: 'center'}}>
            <Typography variant="caption" sx={{fontSize: 'small', cursor: 'default'}}>
              {due_date}
            </Typography>
            {datePickerOpen && (
              <DatePicker
                onChange={(date) => {
                  if (date) {
                    updateItinerary.mutate(
                      {path: `${itinerary.id}`, data: {due_date: date.format('YYYY-MM-DD')}},
                      {onSuccess: () => setDatePickerOpen(false)}
                    );
                  }
                }}
                open={datePickerOpen}
                onClose={() => setDatePickerOpen(false)}
                slots={{field: () => null}}
                slotProps={{
                  popper: {
                    anchorEl: () => buttonRef.current ?? document.body,
                    placement: 'bottom-start',
                    disablePortal: true,
                  },
                }}
              />
            )}
            <IconButton ref={buttonRef} onClick={() => setDatePickerOpen(true)} sx={{p: 0}}>
              <Edit sx={{color: 'white'}} fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{display: 'flex', gap: 0.5}}>
            <Typography variant="caption">Fremhæv</Typography>
            <IconButton
              sx={{p: 0}}
              onClick={() => {
                if (highlighted) {
                  setHighlightedItineraries((prev) => prev.filter((id) => id !== itinerary.id));
                } else {
                  setHighlightedItineraries((prev) => [...prev, itinerary.id]);
                }
              }}
            >
              {highlighted ? (
                <VisibilityOffIcon sx={{color: 'white'}} fontSize="small" />
              ) : (
                <VisibilityIcon sx={{color: 'white'}} fontSize="small" />
              )}
            </IconButton>
          </Box>
        </>
      }
    >
      {/* The toggle comes first, so it stays put when the lokationer open below it. */}
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5}}>
        <Typography sx={{fontSize: 'small'}}>Der er {taskCount} opgaver på denne tur.</Typography>
        <IconButton
          size="small"
          sx={{p: 0}}
          aria-label={expanded ? 'Skjul lokationer' : 'Vis lokationer'}
          onClick={() => setExpandItinerary((prev) => ({...prev, [itinerary.id]: !expanded}))}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
      {expanded && locations && locations.length > 0 && (
        <Box sx={{display: 'flex', gap: 0.5, flexDirection: 'column'}}>
          {locations.map((location) => (
            <Box
              key={location.loc_id}
              sx={{
                display: 'flex',
                gap: 0.5,
                alignItems: 'center',
                opacity: location.besoegt ? 0.5 : 1,
              }}
            >
              <Typography sx={{fontSize: 'small', width: 'fit-content'}}>
                <Link
                  sx={{cursor: 'pointer'}}
                  onClick={(e) => {
                    e.stopPropagation();
                    openLocation(location.loc_id);
                  }}
                >
                  {location.loc_name}
                </Link>
              </Typography>
              {location.besoegt && (
                <CheckCircle titleAccess="Besøgt" color="success" sx={{fontSize: 16}} />
              )}
            </Box>
          ))}
        </Box>
      )}
    </ItineraryCardLayout>
  );
});

/** Shows one tab's content and hides the other's, without unmounting it. */
const TabPanel = ({show, children}: {show: boolean; children: ReactNode}) => (
  <Box
    sx={{
      display: show ? 'flex' : 'none',
      flexDirection: 'column',
      // Lets the scrolling list inside shrink to the window instead of growing past it.
      minHeight: 0,
      flex: 1,
    }}
  >
    {children}
  </Box>
);

const ItineraryList = () => {
  const [mode, setMode] = useAtom(turlisteModeAtom);
  // Both tabs stay mounted once opened. Remounting the active list rebuilt every turkort and,
  // with the opgaver older than a minute, refetched all opgaver (useTasks) on every switch.
  // Historik is only mounted once it has been opened, so it isn't fetched unless used.
  const [historyOpened, setHistoryOpened] = useState(mode === 'history');
  if (mode === 'history' && !historyOpened) setHistoryOpened(true);

  return (
    <Box
      sx={{
        display: 'flex',
        maxHeight: '100%',
        gap: 1,
        flexDirection: 'column',
      }}
    >
      <Box sx={{flexShrink: 0}}>
        {/* Right padding leaves room for the window's close button in the corner. */}
        <Typography variant="h6" sx={{p: 1, pr: 6}}>
          Ture
        </Typography>
        <Tabs value={mode} onChange={(_, value: typeof mode) => setMode(value)} variant="fullWidth">
          <Tab value="active" label="Aktive ture" />
          <Tab value="history" label="Historik" />
        </Tabs>
      </Box>
      <TabPanel show={mode === 'active'}>
        <ActiveItineraries />
      </TabPanel>
      {historyOpened && (
        <TabPanel show={mode === 'history'}>
          <ItineraryHistoryList />
        </TabPanel>
      )}
    </Box>
  );
};

const ActiveItineraries = () => {
  const [openDialog, setOpenDialog] = useState(false);

  const {user_id} = useUser();
  const {data} = useItineraries({
    select: useCallback((data: Taskitinerary[]) => selectData(data, user_id), [user_id]),
  });

  const itinerary_id = useDisplayState((state) => state.itinerary_id);

  const {tasks} = useTaskState();
  // Opgaver per tur, counted in one pass instead of filtering every opgave per card.
  const taskCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const task of tasks ?? []) {
      if (task.itinerary_id)
        counts.set(task.itinerary_id, (counts.get(task.itinerary_id) ?? 0) + 1);
    }
    return counts;
  }, [tasks]);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = lastScrollTop;
    }
  }, []);

  return (
    <>
      <Box
        ref={scrollContainerRef}
        onScroll={(e) => {
          lastScrollTop = e.currentTarget.scrollTop;
        }}
        sx={{overflowY: 'auto', overflowX: 'hidden'}}
      >
        <Box
          sx={{
            px: 1,
          }}
        >
          <TooltipWrapper
            description="Læs mere om ture i vores dokumentation for at få et bedre overblik over hvordan du kan bruge ture i Field appen"
            url="https://watsonc.dk/guides/opgavestyring/#serviceture"
          >
            <Button
              bttype="primary"
              fullWidth
              startIcon={<AddCircleOutlined />}
              onClick={() => setOpenDialog(true)}
            >
              Opret ny tur
            </Button>
          </TooltipWrapper>
        </Box>
        {data && (
          <Box
            sx={{
              pb: 0.5,
            }}
          >
            {Object.entries(data).map(([month, itineraries]) => {
              return (
                <Box
                  key={month}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      px: 0.5,
                      pt: 1,
                      fontWeight: 'bold',
                    }}
                  >
                    {month}
                  </Typography>
                  {itineraries.map((itinerary) => {
                    return (
                      <ItineraryCard
                        key={itinerary.id}
                        itinerary={itinerary}
                        selected={itinerary_id === itinerary.id}
                        taskCount={taskCounts.get(itinerary.id) ?? 0}
                      />
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
    </>
  );
};

export default ItineraryList;
