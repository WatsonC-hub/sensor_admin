import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  FormHelperText,
  IconButton,
  InputAdornment,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import React, {useState} from 'react';
import {get, useFieldArray, useFormContext, useWatch} from 'react-hook-form';

import Button from '~/components/Button';
import FormCheckbox from '~/components/formComponents/FormCheckbox';
import FormInput from '~/components/FormInput';
import {compactInput, fieldRowSx} from '~/features/fieldObservation/formLayout';

import type {FieldValues} from 'react-hook-form';
import type {RelationCandidate} from '~/features/fieldObservation/relations';
import type {TypeField} from '~/features/fieldObservation/types';

/**
 * Inputs for an observationstype's typefelter, built from its definition. Uses the project's
 * form components (FormInput, FormCheckbox), so it must be rendered inside the dialog's form.
 *
 * Laid out for a phone: short values (numbers, dates, choices) sit side by side in a wrapping
 * row, and only free text gets a line of its own.
 */

type Props = {
  fields: TypeField[];
  /** The stored properties, used to show archived fields that still have a value. */
  stored: Record<string, unknown>;
  disabled: boolean;
  /** What a relation field may point to, nearest first. */
  relationCandidates: (field: TypeField) => RelationCandidate[];
};

type Row = Record<string, unknown>;

const NO_CANDIDATES: RelationCandidate[] = [];

const hasValue = (value: unknown) =>
  value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0);

const formatNumber = (value: number) => value.toLocaleString('da-DK', {maximumFractionDigits: 2});

/** How much room a typefelt takes in a wrapping row. */
const fieldFlex = (field: TypeField) => {
  switch (field.kind) {
    // A few digits and decimals.
    case 'number':
      return '0 1 120px';
    case 'date':
      return '0 1 160px';
    case 'boolean':
      return '0 0 auto';
    case 'select':
    case 'relation':
      return '1 1 140px';
    case 'text':
    case 'group':
      return '1 1 100%';
  }
};

const RelationInput = ({
  name,
  field,
  disabled,
  candidates,
}: {
  name: string;
  field: TypeField;
  disabled: boolean;
  candidates: RelationCandidate[];
}) => {
  const value: unknown = useWatch({name});
  const options: Record<string, string>[] = [
    {'': 'Ingen'},
    ...candidates.map((candidate) => ({[candidate.id]: candidate.label})),
  ];
  // The target may be deleted, or not on this device.
  if (typeof value === 'string' && value && !candidates.some((c) => c.id === value)) {
    options.push({[value]: 'Ukendt eller slettet'});
  }
  return (
    <FormInput<FieldValues>
      name={name}
      label={field.label}
      {...compactInput()}
      select
      disabled={disabled}
      options={options}
    />
  );
};

/** One input for a single-value typefelt, bound to the form at `name`. */
const ScalarInput = ({
  name,
  field,
  disabled,
  candidates = NO_CANDIDATES,
  from,
}: {
  name: string;
  field: TypeField;
  disabled: boolean;
  candidates?: RelationCandidate[];
  /** A number in a feltgruppe row: where the row's interval starts, shown before the value. */
  from?: number;
}) => {
  const readOnly = disabled || !!field.archived;
  const common = {
    name,
    label: field.label,
    disabled: readOnly,
    helperText: field.archived ? 'Arkiveret felt' : undefined,
  };
  switch (field.kind) {
    case 'boolean':
      return (
        <FormCheckbox<FieldValues>
          name={name}
          label={field.label}
          disabled={readOnly}
          gridSizes={12}
        />
      );
    case 'number':
      return (
        <FormInput<FieldValues>
          {...common}
          type="number"
          {...compactInput({
            htmlInput: {inputMode: 'decimal', step: 'any'},
            input:
              from === undefined
                ? undefined
                : {
                    startAdornment: (
                      <InputAdornment position="start" sx={{mr: 0.5}}>
                        <Typography variant="body2" sx={{color: 'text.secondary'}}>
                          {formatNumber(from)} –
                        </Typography>
                      </InputAdornment>
                    ),
                  },
          })}
        />
      );
    case 'select':
      return (
        <FormInput<FieldValues>
          {...common}
          {...compactInput()}
          select
          options={[
            {'': 'Ikke angivet'},
            ...(field.options ?? []).map((option) => ({[option]: option})),
          ]}
        />
      );
    case 'relation':
      return (
        <RelationInput name={name} field={field} disabled={readOnly} candidates={candidates} />
      );
    case 'date':
      return <FormInput<FieldValues> {...common} {...compactInput()} type="date" />;
    case 'text':
    case 'group':
      return <FormInput<FieldValues> {...common} {...compactInput()} multiline />;
  }
};

/** Flyt op, Flyt ned and Slet for a feltgruppe row, behind one button to save room. */
const RowMenu = ({
  index,
  count,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  onMove: (to: number) => void;
  onRemove: () => void;
}) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const act = (action: () => void) => () => {
    setAnchor(null);
    action();
  };
  return (
    <>
      <IconButton
        size="small"
        aria-label={`Handlinger for række ${index + 1}`}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{mt: 0.5}}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchor} open={anchor !== null} onClose={() => setAnchor(null)}>
        <MenuItem disabled={index === 0} onClick={act(() => onMove(index - 1))}>
          <ListItemIcon>
            <ArrowUpwardIcon fontSize="small" />
          </ListItemIcon>
          Flyt op
        </MenuItem>
        <MenuItem disabled={index === count - 1} onClick={act(() => onMove(index + 1))}>
          <ListItemIcon>
            <ArrowDownwardIcon fontSize="small" />
          </ListItemIcon>
          Flyt ned
        </MenuItem>
        <MenuItem onClick={act(onRemove)}>
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" />
          </ListItemIcon>
          Slet række
        </MenuItem>
      </Menu>
    </>
  );
};

/**
 * A feltgruppe as an ordered list of rows. For a field marked `increasing` (geologi's bottom),
 * the row's interval shows in that field: from the row above's value down to its own.
 */
const GroupInput = ({field, disabled}: {field: TypeField; disabled: boolean}) => {
  const name = `properties.${field.key}`;
  const {control, formState} = useFormContext();
  const {fields: rows, append, remove, move} = useFieldArray({control, name});
  const values = (useWatch({control, name}) as Row[] | undefined) ?? [];
  const readOnly = disabled || !!field.archived;
  const subFields = (field.fields ?? []).filter(
    (sub) => !sub.archived || values.some((row) => hasValue(row?.[sub.key]))
  );
  const depthField = subFields.find((sub) => sub.increasing);

  // Each row's interval starts at the last bottom above it (0 for the first).
  const starts: number[] = [];
  let top = 0;
  for (const row of values) {
    starts.push(top);
    const bottom = depthField ? row?.[depthField.key] : undefined;
    if (typeof bottom === 'number') top = bottom;
  }

  const error = get(formState.errors, name) as
    | {message?: string; root?: {message?: string}}
    | undefined;
  const groupMessage = error?.message ?? error?.root?.message;

  return (
    <Box>
      <Typography variant="subtitle1" sx={{fontWeight: 700, mb: 0.5}}>
        {field.label}
      </Typography>
      <Stack spacing={0.75}>
        {rows.map((row, index) => (
          <Paper
            key={row.id}
            variant="outlined"
            sx={{display: 'flex', alignItems: 'flex-start', gap: 0.5, pl: 1, pr: 0.25, py: 1}}
          >
            <Box sx={{...fieldRowSx, flex: 1, minWidth: 0}}>
              {subFields.map((sub) => (
                <Box key={sub.key} sx={{flex: fieldFlex(sub), minWidth: 0}}>
                  <ScalarInput
                    name={`${name}.${index}.${sub.key}`}
                    field={sub}
                    disabled={readOnly}
                    from={sub === depthField ? starts[index] : undefined}
                  />
                </Box>
              ))}
            </Box>
            {!readOnly && (
              <RowMenu
                index={index}
                count={rows.length}
                onMove={(to) => move(index, to)}
                onRemove={() => remove(index)}
              />
            )}
          </Paper>
        ))}
      </Stack>
      {groupMessage && <FormHelperText error>{groupMessage}</FormHelperText>}
      {!readOnly && (
        <Button bttype="tertiary" size="small" startIcon={<AddIcon />} onClick={() => append({})}>
          Tilføj række
        </Button>
      )}
    </Box>
  );
};

const TypeFieldInputs = ({fields, stored, disabled, relationCandidates}: Props) => {
  // Archived fields are only shown, read-only, when this feltobservation has a value in them.
  const shown = fields.filter((field) => !field.archived || hasValue(stored[field.key]));
  if (shown.length === 0) return null;

  return (
    <Box sx={fieldRowSx}>
      {shown.map((field) => (
        <Box key={field.key} sx={{flex: fieldFlex(field), minWidth: 0}}>
          {field.kind === 'group' ? (
            <GroupInput field={field} disabled={disabled} />
          ) : (
            <ScalarInput
              name={`properties.${field.key}`}
              field={field}
              disabled={disabled}
              candidates={field.kind === 'relation' ? relationCandidates(field) : undefined}
            />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default TypeFieldInputs;
