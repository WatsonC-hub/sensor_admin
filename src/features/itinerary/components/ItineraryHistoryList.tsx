import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Person from '@mui/icons-material/Person';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import React, {useState} from 'react';

import {useUser} from '~/features/auth/useUser';
import {useTaskUsers} from '~/features/tasks/api/useTasks';
import {convertDate} from '~/helpers/dateConverter';
import {useDisplayState} from '~/hooks/ui';
import useDebouncedValue from '~/hooks/useDebouncedValue';
import LoadingSkeleton from '~/LoadingSkeleton';

import {useItineraryHistory} from '../api/useItinerary';
import {afslutningsaarsagLabel} from '../helpers';
import ItineraryCardLayout from './ItineraryCardLayout';

import type {Taskitinerary} from '../types';

/** Turhistorik: the afsluttede ture, newest first. Opens a tur read-only in the turvindue. */
const ItineraryHistoryList = () => {
  const {user_id} = useUser();
  const [onlyMine, setOnlyMine] = useState(true);
  const [search, setSearch] = useState('');
  // Wait until the user stops typing before searching.
  const debouncedSearch = useDebouncedValue(search, 300);

  const {data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage} =
    useItineraryHistory({
      assigned_to: onlyMine ? (user_id ?? null) : null,
      search: debouncedSearch,
    });

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, minHeight: 0, flex: 1}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1, px: 1, flexShrink: 0}}>
        {/* Same look as the map's lokation search: a white pill with a search icon. */}
        <TextField
          size="small"
          placeholder="Søg på turnavn..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" sx={{color: 'text.secondary'}} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    edge="end"
                    aria-label="Ryd søgning"
                    onClick={() => setSearch('')}
                  >
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
          sx={{
            flex: 1,
            minWidth: 0,
            '& .MuiOutlinedInput-root': {
              borderRadius: '9999px',
              backgroundColor: 'white',
              '& fieldset': {borderColor: 'grey.300'},
            },
          }}
        />
        <FormControlLabel
          sx={{mr: 0, flexShrink: 0}}
          control={
            <Switch
              size="small"
              checked={onlyMine}
              onChange={(_, checked) => setOnlyMine(checked)}
            />
          }
          label={
            <Typography variant="body2" sx={{whiteSpace: 'nowrap'}}>
              Kun mine ture
            </Typography>
          }
        />
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          // Room for the selected card's outline and the card shadow, which the
          // scroll container would otherwise clip.
          pt: 0.5,
          pb: 0.5,
        }}
      >
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <Typography variant="body2" sx={{px: 1, color: 'error.main'}}>
            Turhistorikken kunne ikke hentes.
          </Typography>
        ) : data && data.length > 0 ? (
          <>
            {data.map((itinerary) => (
              <CompletedItineraryCard key={itinerary.id} itinerary={itinerary} />
            ))}
            {hasNextPage && (
              <Button
                size="small"
                sx={{flexShrink: 0, alignSelf: 'center'}}
                loading={isFetchingNextPage}
                onClick={() => void fetchNextPage()}
              >
                Vis flere
              </Button>
            )}
          </>
        ) : (
          <Typography variant="body2" sx={{px: 1, color: 'text.secondary'}}>
            Ingen afsluttede ture fundet.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

/** A turkort in the Turhistorik: the same layout as the active list, but read-only. */
const CompletedItineraryCard = ({itinerary}: {itinerary: Taskitinerary}) => {
  const [selectedId, setItineraryId] = useDisplayState((state) => [
    state.itinerary_id,
    state.setItineraryId,
  ]);
  const {data: users} = useTaskUsers();
  const ansvarlig = users?.find((user) => user.id === itinerary.assigned_to)?.display_name;

  return (
    <ItineraryCardLayout
      name={itinerary.name}
      selected={selectedId === itinerary.id}
      onOpen={() => setItineraryId(itinerary.id)}
      clickable
      headerColor="primary.main"
      subtitle={
        <>
          <Person fontSize="small" />
          <Typography
            sx={{
              fontSize: 'small',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {ansvarlig ?? 'Ingen ansvarlig'}
          </Typography>
        </>
      }
      headerRight={
        <>
          <Typography variant="caption" sx={{fontSize: 'small'}}>
            {itinerary.due_date ? convertDate(itinerary.due_date) : 'Ingen dato'}
          </Typography>
          {itinerary.completed_at && (
            <Typography variant="caption">
              Afsluttet {convertDate(itinerary.completed_at)}
            </Typography>
          )}
        </>
      }
    >
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
        <Typography sx={{fontSize: 'small'}}>
          {itinerary.visited_count ?? 0} / {itinerary.link_count ?? 0} lokationer besøgt
        </Typography>
        {itinerary.completion_reason && itinerary.completion_reason !== 'ukendt' && (
          <Chip size="small" label={afslutningsaarsagLabel[itinerary.completion_reason]} />
        )}
      </Box>
    </ItineraryCardLayout>
  );
};

export default ItineraryHistoryList;
