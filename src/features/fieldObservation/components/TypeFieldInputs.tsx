import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import {Box, FormHelperText, IconButton, Paper, Stack, Typography} from '@mui/material';
import React from 'react';
import {get, useFieldArray, useFormContext, useWatch} from 'react-hook-form';

import Button from '~/components/Button';
import FormCheckbox from '~/components/formComponents/FormCheckbox';
import FormInput from '~/components/FormInput';

import type {FieldValues} from 'react-hook-form';
import type {RelationCandidate} from '~/features/fieldObservation/relations';
import type {TypeField} from '~/features/fieldObservation/types';

/**
 * Inputs for an observationstype's typefelter, built from its definition. Uses the project's
 * form components (FormInput, FormCheckbox), so it must be rendered inside the dialog's form.
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
      size="small"
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
}: {
  name: string;
  field: TypeField;
  disabled: boolean;
  candidates?: RelationCandidate[];
}) => {
  const readOnly = disabled || !!field.archived;
  const common = {
    name,
    label: field.label,
    size: 'small' as const,
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
          slotProps={{htmlInput: {inputMode: 'decimal', step: 'any'}}}
        />
      );
    case 'select':
      return (
        <FormInput<FieldValues>
          {...common}
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
      return <FormInput<FieldValues> {...common} type="date" />;
    case 'text':
    case 'group':
      return <FormInput<FieldValues> {...common} />;
  }
};

/**
 * A feltgruppe as an ordered list of rows. For a field marked `increasing` (geologi's bottom),
 * each row also shows its interval: from the row above's value down to its own.
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

  // Each row's interval runs from the bottom of the row above (0 for the first).
  const intervals: (string | null)[] = [];
  let top = 0;
  for (const row of values) {
    const bottom = depthField ? row?.[depthField.key] : undefined;
    if (typeof bottom === 'number') {
      intervals.push(`${formatNumber(top)}–${formatNumber(bottom)} m`);
      top = bottom;
    } else {
      intervals.push(null);
    }
  }

  const error = get(formState.errors, name) as
    | {message?: string; root?: {message?: string}}
    | undefined;
  const groupMessage = error?.message ?? error?.root?.message;

  return (
    <Box>
      <Typography variant="subtitle2" sx={{mb: 1}}>
        {field.label}
      </Typography>
      <Stack spacing={1}>
        {rows.map((row, index) => (
          <Paper key={row.id} variant="outlined" sx={{p: 1}}>
            <Box sx={{display: 'flex', alignItems: 'center'}}>
              <Typography variant="body2" sx={{flex: 1, color: 'text.secondary'}}>
                {index + 1}
                {intervals[index] && ` · ${intervals[index]}`}
              </Typography>
              {!readOnly && (
                <>
                  <IconButton
                    size="small"
                    aria-label="Flyt op"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="Flyt ned"
                    disabled={index === rows.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" aria-label="Slet række" onClick={() => remove(index)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
            {subFields.map((sub) => (
              <ScalarInput
                key={sub.key}
                name={`${name}.${index}.${sub.key}`}
                field={sub}
                disabled={readOnly}
              />
            ))}
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
    <Stack>
      {shown.map((field) =>
        field.kind === 'group' ? (
          <GroupInput key={field.key} field={field} disabled={disabled} />
        ) : (
          <ScalarInput
            key={field.key}
            name={`properties.${field.key}`}
            field={field}
            disabled={disabled}
            candidates={field.kind === 'relation' ? relationCandidates(field) : undefined}
          />
        )
      )}
    </Stack>
  );
};

export default TypeFieldInputs;
