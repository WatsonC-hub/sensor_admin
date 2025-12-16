import {z} from 'zod';
import {zodDayjs} from '~/helpers/schemas';

const baseLocationSchema = z.object({
  groups: z
    .array(
      z.object({
        id: z.string(),
        group_name: z.string(),
      })
    )
    .nullish(),
  x: z
    .number({required_error: 'X-koordinat skal udfyldes'})
    .transform((val) => (typeof val === 'number' ? val : parseFloat(val))),
  y: z
    .number({required_error: 'Y-koordinat skal udfyldes'})
    .transform((val) => (typeof val === 'number' ? val : parseFloat(val))),
  terrainqual: z.string(),
  terrainlevel: z.number().nullish(),
  description: z.string().nullish(),
  loctype_id: z
    .number({message: 'Vælg lokationstype'})
    .min(1, {message: 'Lokationstype skal vælges'}),
  initial_project_no: z.string({message: 'Projektnummer skal udfyldes'}),
});

const defaultAddLocationSchema = baseLocationSchema.extend({
  loc_name: z.string({message: 'Lokationsnavn skal udfyldes'}).min(3, {
    message: 'Lokationsnavn skal være mindst 3 tegn',
  }),
});

const defaultEditLocationSchema = defaultAddLocationSchema;

const boreholeAddLocationSchema = baseLocationSchema.extend({
  boreholeno: z.string({message: 'DGU nummer skal udfyldes'}).min(1, {
    message: 'DGU nummer skal udfyldes',
  }),
  suffix: z.string().nullish(),
});

const boreholeEditLocationSchema = boreholeAddLocationSchema.extend({
  initial_project_no: z.string(),
});

const baseTimeseriesSchema = z.object({
  sensor_depth_m: z.number().nullish(),
  prefix: z.string().nullish(),
  calypso_id: z.number().optional(),
});

const baseAddTimeseriesSchema = baseTimeseriesSchema.extend({
  tstype_id: z.number({required_error: 'Vælg tidsserietype'}).gte(1, {
    message: 'Vælg tidsserietype',
  }),
});

const baseEditTimeseriesSchema = baseTimeseriesSchema.extend({
  requires_auth: z.boolean().default(false),
  hide_public: z.boolean().default(false),
});

const defaultEditTimeseriesSchema = baseEditTimeseriesSchema;

const defaultAddTimeseriesSchema = baseAddTimeseriesSchema;

const boreholeEditTimeseriesSchema = baseTimeseriesSchema.extend({
  intakeno: z.number().nullish(),
});

const boreholeAddTimeseriesSchema = baseAddTimeseriesSchema.extend({
  intakeno: z.number().optional(),
});

const watlevmpAddSchema = z.object({
  elevation: z.number({required_error: 'Målepunkt skal udfyldes'}).nullable(),
  description: z
    .string({required_error: 'Beskrivelse skal udfyldes'})
    .min(3, {message: 'Beskrivelse skal være mindst 3 tegn'}),
});

const addUnitSchema = z
  .object({
    unit_uuid: z.string({required_error: 'Vælg calypso ID'}).min(1, {message: 'Vælg calypso ID'}),
    startdate: zodDayjs('Startdato skal udfyldes'),
  })
  .refine((unit) => unit.startdate !== undefined, {
    message: 'Startdato skal udfyldes',
  });

const editUnitSchema = z
  .object({
    unit_uuid: z.string().min(1, {message: 'Vælg calypso ID'}),
    startdate: zodDayjs('Startdato skal udfyldes'),
    enddate: zodDayjs('Slutdato skal udfyldes'),
  })
  .superRefine((unit, ctx) => {
    if (unit.startdate.isSameOrAfter(unit.enddate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: 'start dato må ikke være senere end slut dato',
        path: ['startdate'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: 'slut dato må ikke være tidligere end start dato',
        path: ['enddate'],
      });
    }
  });

export {
  baseLocationSchema,
  addUnitSchema,
  editUnitSchema,
  baseTimeseriesSchema,
  defaultAddLocationSchema,
  defaultEditLocationSchema,
  boreholeAddLocationSchema,
  boreholeEditLocationSchema,
  boreholeAddTimeseriesSchema,
  boreholeEditTimeseriesSchema,
  defaultAddTimeseriesSchema,
  defaultEditTimeseriesSchema,
  watlevmpAddSchema,
};

type DefaultAddLocation = z.infer<typeof defaultAddLocationSchema>;
type DefaultEditLocation = z.infer<typeof defaultEditLocationSchema>;
type DefaultAddTimeseries = z.infer<typeof defaultAddTimeseriesSchema>;
type DefaultEditTimeseries = z.infer<typeof defaultEditTimeseriesSchema>;
type BoreholeAddLocation = z.infer<typeof boreholeAddLocationSchema>;
type BoreholeEditLocation = z.infer<typeof boreholeEditLocationSchema>;
type BoreholeAddTimeseries = z.infer<typeof boreholeAddTimeseriesSchema>;
type BoreholeEditTimeseries = z.infer<typeof boreholeEditTimeseriesSchema>;
type BaseLocation = z.infer<typeof baseLocationSchema>;
type AddUnit = z.infer<typeof addUnitSchema>;
type EditUnit = z.infer<typeof editUnitSchema>;
type Watlevmp = z.infer<typeof watlevmpAddSchema>;

export type {
  DefaultAddTimeseries,
  DefaultAddLocation,
  BoreholeAddLocation,
  BoreholeEditLocation,
  BoreholeAddTimeseries,
  BoreholeEditTimeseries,
  DefaultEditLocation,
  BaseLocation,
  DefaultEditTimeseries,
  AddUnit,
  EditUnit,
  Watlevmp,
};
