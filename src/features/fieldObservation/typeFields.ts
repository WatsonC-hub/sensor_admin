import {z} from 'zod';

import type {Geometry, ObservationType, TypeField} from '~/features/fieldObservation/types';

/**
 * Typefelter: validation of a feltobservation's `properties` against its type's fields.
 * The same rules live in python_api's `typefields.py`; keep the two in step.
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isDate = (value: string) => {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
};

const numberSchema = (field: TypeField) => {
  const schema = z.number({error: `${field.label} skal være et tal`});
  if (field.min_exclusive === null || field.min_exclusive === undefined) return schema;
  return schema.gt(field.min_exclusive, {
    error: `${field.label} skal være større end ${field.min_exclusive}`,
  });
};

/** A feltgruppe: a list of items, each validated like `properties` against the group's fields. */
const groupSchema = (field: TypeField) => {
  const subFields = field.fields ?? [];
  return z
    .array(propertiesSchema(subFields))
    .superRefine((items, ctx) => {
      for (const sub of subFields.filter((candidate) => candidate.increasing)) {
        let previous: number | null = null;
        items.forEach((item, index) => {
          const value = item[sub.key];
          if (typeof value !== 'number') return;
          if (previous !== null && value <= previous) {
            ctx.addIssue({
              code: 'custom',
              path: [index, sub.key],
              message: `${sub.label} skal være større end i rækken over`,
            });
          }
          previous = value;
        });
      }
    })
    .transform((items) => (items.length === 0 ? null : items));
};

const fieldSchema = (field: TypeField): z.ZodType<unknown, unknown> => {
  switch (field.kind) {
    case 'text':
      return z.string().transform((value) => value.trim() || null);
    case 'number':
      return numberSchema(field);
    case 'boolean':
      return z.boolean();
    case 'select':
      return z
        .string()
        .refine((value) => value === '' || (field.options ?? []).includes(value), {
          error: `Vælg en af mulighederne i ${field.label}`,
        })
        .transform((value) => value || null);
    case 'date':
      return z
        .string()
        .refine((value) => value === '' || isDate(value), {error: 'Ugyldig dato'})
        .transform((value) => value || null);
    case 'relation':
      return z
        .string()
        .refine((value) => value === '' || UUID_PATTERN.test(value), {
          error: `Ugyldig værdi i ${field.label}`,
        })
        .transform((value) => value || null);
    case 'group':
      return groupSchema(field);
  }
};

/**
 * Zod for `properties`. Keys the type doesn't define are dropped, and empty values are left
 * out, so the result only holds what the server accepts. Archived fields keep their values.
 */
export function propertiesSchema(fields: TypeField[]) {
  return z
    .record(z.string(), z.unknown())
    .pipe(
      z.object(Object.fromEntries(fields.map((field) => [field.key, fieldSchema(field).nullish()])))
    )
    .transform((values): Record<string, unknown> =>
      Object.fromEntries(
        Object.entries(values).filter(([, value]) => value !== null && value !== undefined)
      )
    );
}

const POSTGIS_TYPES: Record<Geometry['type'], string> = {
  Point: 'POINT',
  LineString: 'LINESTRING',
  Polygon: 'POLYGON',
};

/** Whether a type allows a geometry type. No list on the type means any geometry. */
export const allowsGeometry = (type: ObservationType, geometryType: Geometry['type']) =>
  !type.geometry_types || type.geometry_types.includes(POSTGIS_TYPES[geometryType]);

/** Typefelter that can be filled in from a file column (not groups or relations). */
export const isScalarField = (field: TypeField) =>
  field.kind !== 'group' && field.kind !== 'relation';
