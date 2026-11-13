import {Box, Chip, Tab, Tabs, Typography} from '@mui/material';
import React, {useState} from 'react';

import EditableField from '~/components/EditableField';
import {useTaskManagement} from '~/features/opgavestyring/api/useTaskManagement';
import TripPreparation from '~/features/opgavestyring/components/TripPreparation';
import {useTaskUsers} from '~/features/tasks/api/useTasks';
import {convertDate, convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {useDisplayState} from '~/hooks/ui';
import useBreakpoints from '~/hooks/useBreakpoints';
import LoadingSkeleton from '~/LoadingSkeleton';

import {useItinerary, useItineraryMutations} from '../api/useItinerary';
import {afslutningsaarsagLabel} from '../helpers';
import ItineraryLocations from './ItineraryLocations';
import ItineraryTimeline from './ItineraryTimeline';

import type {Taskitinerary} from '../types';

type TurTab = 'forberedelse' | 'lokationer' | 'forloeb';

/**
 * The window for one tur. Active and afsluttede ture share one layout: a header with the
 * tur's info, then tabs. An afsluttet tur is read-only and has no Forberedelse tab.
 */
const ItineraryWindow = () => {
  const {isMobile} = useBreakpoints();
  const itinerary_id = useDisplayState((state) => state.itinerary_id);
  const {data: itinerary, isLoading, isError} = useItinerary(itinerary_id);

  if (itinerary_id === null) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        mt: 4,
        mb: isMobile ? 0 : 2,
        overflow: 'hidden',
      }}
    >
      {/* isLoading, not isPending: a disabled query (no access) stays pending forever. */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : isError ? (
        <Typography sx={{p: 2}}>Turen kunne ikke hentes.</Typography>
      ) : !itinerary ? (
        // The backend answers null for a tur that doesn't exist or isn't the org's.
        <Typography sx={{p: 2}}>Turen findes ikke.</Typography>
      ) : (
        // Keyed on completed too: a tur can be afsluttet automatically while it's open, and
        // then the Forberedelse tab no longer exists.
        <ItineraryView key={`${itinerary.id}-${itinerary.completed}`} itinerary={itinerary} />
      )}
    </Box>
  );
};

const ItineraryView = ({itinerary}: {itinerary: Taskitinerary}) => {
  const completed = itinerary.completed;
  const [tab, setTab] = useState<TurTab>(completed ? 'lokationer' : 'forberedelse');

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: 1}}>
      <ItineraryHeader itinerary={itinerary} />
      <Tabs value={tab} onChange={(_, value: TurTab) => setTab(value)} variant="fullWidth">
        {!completed && <Tab value="forberedelse" label="Forberedelse" />}
        <Tab value="lokationer" label="Lokationer" />
        <Tab value="forloeb" label="Forløb" />
      </Tabs>
      <Box sx={{overflow: 'auto', px: 1}}>
        {tab === 'forberedelse' && <PreparationTab itinerary_id={itinerary.id} />}
        {tab === 'lokationer' && (
          <ItineraryLocations itinerary_id={itinerary.id} completed={completed} />
        )}
        {tab === 'forloeb' && <ItineraryTimeline itinerary_id={itinerary.id} />}
      </Box>
    </Box>
  );
};

const PreparationTab = ({itinerary_id}: {itinerary_id: string}) => {
  const data = useTaskManagement(itinerary_id);
  return <TripPreparation data={data} />;
};

/**
 * Name, comment and key facts of the tur. The name and comment can be edited on an active
 * tur; on an afsluttet tur everything is read-only.
 */
const ItineraryHeader = ({itinerary}: {itinerary: Taskitinerary}) => {
  const completed = itinerary.completed;
  const {
    patch: {mutate: updateItinerary},
  } = useItineraryMutations();
  const {data: users} = useTaskUsers();
  const userName = (id: string | null | undefined) =>
    id ? users?.find((user) => user.id === id)?.display_name : undefined;

  const ansvarlig = userName(itinerary.assigned_to);
  const afsluttetAf = userName(itinerary.completed_by);
  const updateField = (field: 'name' | 'comment', value: string | null) =>
    updateItinerary({path: itinerary.id, data: {[field]: value}});

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5, px: 1}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
        {completed ? (
          <Typography variant="h6">{itinerary.name || 'Unavngiven tur'}</Typography>
        ) : (
          <EditableField
            label={itinerary.name}
            placeholder="Indtast navn..."
            variant="title"
            onSave={(value) => updateField('name', value)}
          />
        )}
        {completed && itinerary.completion_reason && itinerary.completion_reason !== 'ukendt' && (
          <Chip size="small" label={afslutningsaarsagLabel[itinerary.completion_reason]} />
        )}
      </Box>
      {completed ? (
        itinerary.comment && <Typography variant="body2">{itinerary.comment}</Typography>
      ) : (
        <EditableField
          label={itinerary.comment}
          placeholder="Indtast kommentar..."
          multiline
          onSave={(value) => updateField('comment', value)}
        />
      )}
      <Typography variant="body2" sx={{color: 'text.secondary'}}>
        {[
          itinerary.due_date ? `Planlagt ${convertDate(itinerary.due_date)}` : null,
          ansvarlig ? `Ansvarlig: ${ansvarlig}` : null,
          itinerary.completed_at
            ? `Afsluttet ${convertDateWithTimeStamp(itinerary.completed_at)}${
                afsluttetAf ? ` af ${afsluttetAf}` : ''
              }`
            : null,
          `${itinerary.visited_count ?? 0} / ${itinerary.link_count ?? 0} besøgt`,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Typography>
    </Box>
  );
};

export default ItineraryWindow;
