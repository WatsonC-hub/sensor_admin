import CheckCircle from '@mui/icons-material/CheckCircle';
import {Box, Chip, Link, Typography} from '@mui/material';
import React, {useMemo} from 'react';

import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import LoadingSkeleton from '~/LoadingSkeleton';

import {useItineraryLinks} from '../api/useItinerary';
import {locationsOnTur, movedLabel, tilknytningSlutLabel} from '../helpers';

import type {LocationOnTur} from '../helpers';
import type {Tilknytning} from '../types';

type Props = {
  itinerary_id: string;
  /** On an afsluttet tur nothing is left to visit, so rows aren't dimmed. */
  completed?: boolean;
};

/** Every lokation that has been on the tur, and how it left the tur. */
const ItineraryLocations = ({itinerary_id, completed = false}: Props) => {
  const {data: links, isPending} = useItineraryLinks(itinerary_id);
  const rows = useMemo(() => locationsOnTur(links ?? []), [links]);

  if (isPending) return <LoadingSkeleton />;

  if (rows.length === 0)
    return (
      <Typography variant="body2" sx={{p: 1, color: 'text.secondary'}}>
        Der har ikke været lokationer på denne tur.
      </Typography>
    );

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
      {rows.map((location) => (
        <ItineraryLocationRow key={location.loc_id} location={location} dim={!completed} />
      ))}
    </Box>
  );
};

/** How a tilknytning ended, as a label. */
const endLabel = (link: Tilknytning) =>
  link.end_event
    ? (movedLabel(link) ?? tilknytningSlutLabel[link.end_event])
    : link.is_open
      ? 'På turen'
      : // Ended by the old backend, before the migration gave it a reason.
        'Afsluttet';

const ItineraryLocationRow = ({location, dim}: {location: LocationOnTur; dim: boolean}) => {
  const {location: openLocation} = useNavigationFunctions();
  const {latest, visit, open, besoegt} = location;
  // Visited, then put on the tur again and moved or removed without work.
  const laterLabel = besoegt && visit !== latest ? endLabel(latest) : null;
  const later = laterLabel && laterLabel.charAt(0).toLowerCase() + laterLabel.slice(1);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        px: 1,
        py: 0.5,
        borderRadius: 1,
        bgcolor: 'grey.50',
        opacity: !dim || open ? 1 : besoegt ? 0.6 : 0.45,
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0}}>
        {besoegt && <CheckCircle fontSize="small" color="success" />}
        <Link
          sx={{cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis'}}
          onClick={() => openLocation(location.loc_id)}
        >
          {location.loc_name}
        </Link>
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0}}>
        {later && (
          <Typography variant="caption" sx={{color: 'text.secondary', textAlign: 'right'}}>
            senere {later}
          </Typography>
        )}
        <Chip
          size="small"
          label={besoegt ? 'Besøgt' : endLabel(latest)}
          color={open ? 'primary' : besoegt ? 'success' : 'default'}
          variant={open ? 'filled' : 'outlined'}
        />
      </Box>
    </Box>
  );
};

export default ItineraryLocations;
