import {
  Alert,
  Box,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React from 'react';

import {Swatch} from '~/features/fieldObservation/components/Legend';
import {PhotoStrip} from '~/features/fieldObservation/components/ObservationPhotos';
import {directionText} from '~/features/fieldObservation/geo';
import {directionFromRelation, linkedTo} from '~/features/fieldObservation/relations';
import {resolveStyle} from '~/features/fieldObservation/styles';

import type {FieldObservationDb} from '~/features/fieldObservation/db';
import type {
  LocalObservation,
  ObservationType,
  Project,
  TypeField,
} from '~/features/fieldObservation/types';

type Props = {
  db: FieldObservationDb;
  observation: LocalObservation;
  types: ObservationType[];
  projects: Project[];
  observations: LocalObservation[];
  onOpenObservation: (id: string) => void;
  /** The projekt chosen on the map; the Projekt row is left out when it says the same. */
  selectedProjectNo: string | null;
};

const formatNumber = (value: number) => value.toLocaleString('da-DK', {maximumFractionDigits: 2});

const asText = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Ja' : 'Nej';
  if (typeof value === 'number') return formatNumber(value);
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
};

const isEmpty = (value: unknown) =>
  value === null ||
  value === undefined ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

/** Label and value side by side, as in a compact key–value list. */
const Row = ({label, children}: {label: string; children: React.ReactNode}) => (
  <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(100px, 40%) 1fr', columnGap: 2}}>
    <Typography variant="body2" sx={{color: 'text.secondary'}}>
      {label}
    </Typography>
    <Typography variant="body2" component="div" sx={{overflowWrap: 'anywhere'}}>
      {children}
    </Typography>
  </Box>
);

/** A feltgruppe as a small table; an `increasing` field (geologi's bottom) becomes Fra–til. */
const GroupTable = ({field, rows}: {field: TypeField; rows: Record<string, unknown>[]}) => {
  const subFields = field.fields ?? [];
  const depth = subFields.find((sub) => sub.increasing);
  const others = subFields.filter(
    (sub) => sub !== depth && rows.some((row) => !isEmpty(row[sub.key]))
  );
  // Each row runs from the bottom of the row above (0 for the first).
  const intervals: string[] = [];
  let top = 0;
  for (const row of rows) {
    const bottom = depth ? row[depth.key] : undefined;
    if (typeof bottom === 'number') {
      intervals.push(`${formatNumber(top)}–${formatNumber(bottom)}`);
      top = bottom;
    } else {
      intervals.push('');
    }
  }
  return (
    <Box>
      <Typography variant="body2" sx={{color: 'text.secondary', mb: 0.5}}>
        {field.label}
      </Typography>
      <Table size="small" sx={{'& td, & th': {px: 1, py: 0.5}}}>
        <TableHead>
          <TableRow>
            {depth && <TableCell>m u.t.</TableCell>}
            {others.map((sub) => (
              <TableCell key={sub.key}>{sub.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            // Rows have no id of their own; their position is their identity.
            // oxlint-disable-next-line react/no-array-index-key
            <TableRow key={index}>
              {depth && <TableCell sx={{whiteSpace: 'nowrap'}}>{intervals[index]}</TableCell>}
              {others.map((sub) => (
                <TableCell key={sub.key}>{asText(row[sub.key])}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

const syncText = (observation: LocalObservation) => {
  if (observation.dirty === -1) return `Afvist af serveren: ${observation.sync_error}`;
  if (observation.dirty === 1) return 'Ikke overført endnu';
  return null;
};

/** Vis: a compact, read-only view of a feltobservation. */
const ObservationView = ({
  db,
  observation,
  types,
  projects,
  observations,
  onOpenObservation,
  selectedProjectNo,
}: Props) => {
  const type = types.find((candidate) => candidate.id === observation.type_id);
  const fields = type?.fields ?? [];
  const project = projects.find((candidate) => candidate.project_no === observation.project_no);
  const direction = directionFromRelation(
    observation.geom,
    observation.properties,
    fields,
    observations
  );
  const linked = linkedTo(observation, observations, types);
  const status = syncText(observation);
  const customFields = (observation.custom_fields as {label?: unknown; value?: unknown}[]).filter(
    (field) => field && typeof field === 'object' && !isEmpty(field.value)
  );
  const relationLabel = (id: string) => {
    const target = observations.find((candidate) => candidate.id === id);
    if (!target || target.deleted_at) return 'Ukendt eller slettet';
    const name = types.find((candidate) => candidate.id === target.type_id)?.name;
    return `${name ?? 'Feltobservation'}${target.note ? ` – ${target.note.slice(0, 30)}` : ''}`;
  };

  const filled = fields.filter((field) => !isEmpty(observation.properties[field.key]));

  return (
    <Stack spacing={1.5}>
      <PhotoStrip db={db} observationId={observation.id} />
      {status && (
        <Alert severity={observation.dirty === -1 ? 'error' : 'info'} sx={{py: 0}}>
          {status}
        </Alert>
      )}
      <Stack spacing={0.5}>
        <Row label="Type">
          <Box component="span" sx={{display: 'inline-flex', alignItems: 'center', gap: 1}}>
            {type && (
              <Swatch
                kind={
                  type.geometry_types?.[0] === 'LINESTRING' ||
                  type.geometry_types?.[0] === 'POLYGON'
                    ? type.geometry_types[0]
                    : 'POINT'
                }
                {...resolveStyle(type, observation.properties)}
              />
            )}
            {type?.name ?? 'Ukendt type'}
          </Box>
        </Row>
        {(selectedProjectNo === null || observation.project_no !== selectedProjectNo) && (
          <Row label="Projekt">
            {observation.project_no
              ? `${observation.project_no}${project?.project_title ? ` – ${project.project_title}` : ''}`
              : 'Intet projekt'}
          </Row>
        )}
        {observation.note && <Row label="Note">{observation.note}</Row>}
        {observation.internal_note && <Row label="Intern note">{observation.internal_note}</Row>}
        {filled
          .filter((field) => field.kind !== 'group')
          .map((field) => {
            const value = observation.properties[field.key];
            return (
              <Row key={field.key} label={field.label}>
                {field.kind === 'relation' && typeof value === 'string' ? (
                  <Link component="button" variant="body2" onClick={() => onOpenObservation(value)}>
                    {relationLabel(value)}
                  </Link>
                ) : (
                  asText(value)
                )}
              </Row>
            );
          })}
        {direction?.direction !== null && direction?.direction !== undefined && (
          <Row label="Retning">
            {directionText(direction.direction)}
            {direction.fromRelation ? ' fra brønden' : ''}
          </Row>
        )}
      </Stack>

      {filled
        .filter((field) => field.kind === 'group')
        .map((field) => (
          <GroupTable
            key={field.key}
            field={field}
            rows={observation.properties[field.key] as Record<string, unknown>[]}
          />
        ))}

      {linked.length > 0 && (
        <Box>
          <Typography variant="body2" sx={{color: 'text.secondary'}}>
            Tilsluttet ({linked.length})
          </Typography>
          <List dense disablePadding>
            {linked.map((link) => (
              <ListItemButton
                key={link.observation.id}
                sx={{px: 1}}
                onClick={() => onOpenObservation(link.observation.id)}
              >
                <ListItemText
                  primary={`${link.typeName}${link.observation.note ? ` – ${link.observation.note}` : ''}`}
                  secondary={
                    link.direction !== null ? `Retning: ${directionText(link.direction)}` : null
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}

      {customFields.length > 0 && (
        <Box>
          <Typography variant="body2" sx={{color: 'text.secondary', mb: 0.5}}>
            Ekstra felter
          </Typography>
          <Stack spacing={0.5}>
            {customFields.map((field, index) => (
              // oxlint-disable-next-line react/no-array-index-key
              <Row key={index} label={asText(field.label)}>
                {asText(field.value)}
              </Row>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
};

export default ObservationView;
