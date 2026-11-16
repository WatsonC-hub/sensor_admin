import {
  allowsGeometry,
  isScalarField,
  propertiesSchema,
} from '~/features/fieldObservation/typeFields';

import type {
  Geometry,
  ImportFeature,
  ObservationType,
  TypeField,
} from '~/features/fieldObservation/types';

/** Where a source column goes: a typefelt's key, an ekstra felt (custom_fields), or nowhere. */
export type ColumnTarget = {kind: 'field'; key: string} | {kind: 'custom'} | {kind: 'skip'};

const normalize = (text: string) => text.trim().toLowerCase();

/** Pre-match columns to typefelter by key or label; the rest become ekstra felter. */
export const autoMapping = (columns: string[], fields: TypeField[]) =>
  Object.fromEntries(
    columns.map((column): [string, ColumnTarget] => {
      const match = fields.find(
        (field) =>
          !field.archived &&
          isScalarField(field) &&
          (normalize(field.key) === normalize(column) ||
            normalize(field.label) === normalize(column))
      );
      return [column, match ? {kind: 'field', key: match.key} : {kind: 'custom'}];
    })
  );

/** Values in a file are primitives; anything else is shown as JSON rather than "[object Object]". */
const asText = (value: unknown) =>
  typeof value === 'object' ? JSON.stringify(value) : String(value as string | number | boolean);

const TRUE_WORDS = new Set(['ja', 'j', 'true', 'sand', 'yes', 'y', '1', 'x']);
const FALSE_WORDS = new Set(['nej', 'n', 'false', 'falsk', 'no', '0', '']);

/**
 * Bring a value from the file into the shape the typefelt expects. A value that can't be
 * converted is returned as it is, so validation reports it.
 */
export const coerce = (value: unknown, field: TypeField): unknown => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' && value.trim() === '' && field.kind !== 'text') return null;
  switch (field.kind) {
    case 'text':
      return asText(value);
    case 'number': {
      if (typeof value === 'number') return value;
      const number = Number(asText(value).trim().replace(',', '.'));
      return Number.isFinite(number) ? number : value;
    }
    case 'boolean': {
      if (typeof value === 'boolean') return value;
      const word = normalize(asText(value));
      if (TRUE_WORDS.has(word)) return true;
      if (FALSE_WORDS.has(word)) return false;
      return value;
    }
    case 'select': {
      const text = normalize(asText(value));
      return field.options?.find((option) => normalize(option) === text) ?? asText(value);
    }
    case 'date':
      return typeof value === 'string' ? value.trim().slice(0, 10) : value;
  }
};

export type PreparedRow = {
  /** Index of the feature in the file. */
  index: number;
  geom: Geometry;
  properties: Record<string, unknown>;
  customFields: {label: string; value: unknown}[];
  error: string | null;
};

/** Apply the mapping to every feature and validate it against the type. */
export const prepareRows = (
  features: ImportFeature[],
  type: ObservationType,
  mapping: Record<string, ColumnTarget>
): PreparedRow[] => {
  const fields = type.fields ?? [];
  const byKey = new Map(fields.map((field) => [field.key, field]));
  const schema = propertiesSchema(fields);
  return features.map((feature) => {
    const raw: Record<string, unknown> = {};
    const customFields: PreparedRow['customFields'] = [];
    for (const [column, value] of Object.entries(feature.properties)) {
      const target = mapping[column] ?? {kind: 'custom'};
      if (target.kind === 'field') {
        const field = byKey.get(target.key);
        if (field) raw[field.key] = coerce(value, field);
      } else if (target.kind === 'custom' && value !== null && value !== '') {
        customFields.push({label: column, value});
      }
    }
    let error: string | null = null;
    let properties: Record<string, unknown> = {};
    if (!allowsGeometry(type, feature.geometry.type)) {
      error = `${feature.geometry.type} passer ikke til typen ${type.name}`;
    } else {
      const parsed = schema.safeParse(raw);
      if (parsed.success) properties = parsed.data;
      else error = [...new Set(parsed.error.issues.map((issue) => issue.message))].join('; ');
    }
    return {index: feature.id, geom: feature.geometry, properties, customFields, error};
  });
};
