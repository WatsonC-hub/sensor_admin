import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import {Box, Chip, Divider, Link, Typography} from '@mui/material';
import {alpha} from '@mui/material/styles';
import dayjs from 'dayjs';
import React, {useMemo} from 'react';

import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import LoadingSkeleton from '~/LoadingSkeleton';

import {useItineraryForloeb} from '../api/useItinerary';
import {buildForloeb} from '../helpers';

import type {ForloebLine, ForloebProject} from '../helpers';

type Props = {
  itinerary_id: string;
};

/**
 * The Turforløb: a summary per projekt, then the timeline oldest first, by day and by visit.
 * Each visit is tagged with its projekt when the tur covers more than one.
 */
const ItineraryTimeline = ({itinerary_id}: Props) => {
  const {data: events, isPending} = useItineraryForloeb(itinerary_id);
  const {projects, days, completedAt} = useMemo(() => buildForloeb(events ?? []), [events]);

  if (isPending) return <LoadingSkeleton />;

  if (days.length === 0 && !completedAt)
    return (
      <Typography variant="body2" sx={{p: 1, color: 'text.secondary'}}>
        Der er ikke registreret noget på denne tur.
      </Typography>
    );

  const showProjects = projects.length > 1;

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
      {projects.length > 0 && <ProjectSummary projects={projects} />}
      {days.map(({day, lines}) => (
        <Box key={day} sx={{display: 'flex', flexDirection: 'column', gap: 1.5, flexShrink: 0}}>
          <Box>
            <Typography variant="body2" sx={{fontWeight: 'bold', textTransform: 'capitalize'}}>
              {day}
            </Typography>
            <Divider />
          </Box>
          {lines.map((line) => (
            <ForloebRow
              key={`${line.kind}-${line.loc_id}-${line.at}`}
              line={line}
              showProjects={showProjects}
            />
          ))}
        </Box>
      ))}
      {completedAt && (
        <Box sx={{display: 'flex', gap: 1.5, alignItems: 'baseline'}}>
          <Typography variant="body2" sx={{color: 'text.secondary', flexShrink: 0}}>
            {dayjs(completedAt).format('D. MMM HH:mm')}
          </Typography>
          <Typography variant="body2" sx={{fontWeight: 500}}>
            Turen blev afsluttet
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const plural = (count: number, one: string, many: string) =>
  count === 0 ? null : `${count} ${count === 1 ? one : many}`;

/** What was done for each projekt, in the order the projekter were first worked on. */
const ProjectSummary = ({projects}: {projects: ForloebProject[]}) => (
  <Box
    sx={{
      border: '1px solid',
      borderColor: (theme) => alpha(theme.palette.primary.main, 0.5),
      borderRadius: 2,
      overflow: 'hidden',
      flexShrink: 0,
    }}
  >
    <Box
      sx={{
        px: 1.5,
        py: 0.75,
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
        borderBottom: '1px solid',
        borderBottomColor: (theme) => alpha(theme.palette.primary.main, 0.5),
      }}
    >
      <Typography variant="subtitle2" sx={{color: 'primary.main'}}>
        {projects.length === 1 ? 'Projekt' : 'Projekter'}
      </Typography>
    </Box>
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, px: 1.5, py: 1}}>
      {projects.map((project) => (
        <Box key={project.projectno ?? 'none'} sx={{display: 'flex', flexDirection: 'column'}}>
          <Typography variant="body2" sx={{fontWeight: 500}}>
            {project.projectno ?? 'Uden projekt'}
            {project.project_title ? ` · ${project.project_title}` : ''}
          </Typography>
          <Typography variant="caption" sx={{color: 'text.secondary'}}>
            {[
              project.customer_name,
              plural(project.locations, 'lokation', 'lokationer'),
              plural(project.pejlinger, 'pejling', 'pejlinger'),
              plural(project.tilsyn, 'tilsyn', 'tilsyn'),
              plural(project.opgaver, 'opgave lukket', 'opgaver lukket'),
            ]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

const Time = ({at}: {at: string}) => (
  <Typography variant="body2" sx={{color: 'text.secondary', minWidth: 40, flexShrink: 0}}>
    {dayjs(at).format('HH:mm')}
  </Typography>
);

const ForloebRow = ({line, showProjects}: {line: ForloebLine; showProjects: boolean}) => {
  const {location: openLocation} = useNavigationFunctions();

  const lokation = (
    <Link
      variant="body2"
      sx={{cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500}}
      onClick={() => openLocation(line.loc_id)}
    >
      {line.loc_name}
    </Link>
  );

  if (line.kind === 'not_visited')
    return (
      <Box sx={{display: 'flex', gap: 1.5, alignItems: 'baseline'}}>
        <Time at={line.at} />
        <Box sx={{display: 'flex', flexDirection: 'column', minWidth: 0}}>
          {lokation}
          <Typography variant="body2" sx={{color: 'text.secondary', fontStyle: 'italic'}}>
            {line.summary}
          </Typography>
        </Box>
      </Box>
    );

  // A visit: the lokation as a header, then its rows indented under it with a line on
  // the left, so each row clearly belongs to that lokation.
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.25}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0}}>
        <PlaceOutlined sx={{fontSize: 18, color: 'text.secondary', flexShrink: 0}} />
        {lokation}
        {showProjects &&
          line.projectnos.map((projectno) => (
            <Chip
              key={projectno}
              label={projectno}
              size="small"
              variant="outlined"
              color="primary"
              sx={{height: 20, fontSize: 11, flexShrink: 0}}
            />
          ))}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
          ml: '8px',
          pl: 1.5,
          borderLeft: '2px solid',
          borderColor: 'grey.300',
        }}
      >
        {line.items.map((item) => (
          <Box
            key={`${item.at}-${item.text}`}
            sx={{display: 'flex', gap: 1.5, alignItems: 'baseline'}}
          >
            <Time at={item.at} />
            <Typography variant="body2">{item.text}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ItineraryTimeline;
