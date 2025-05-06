import moment from 'moment';
import {z} from 'zod';

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
  terrainqual: z.enum(['dGPS', 'DTM', '']).nullish(),
  terrainlevel: z.number().nullish(),
  description: z.string().nullish(),
  loctype_id: z
    .number({message: 'Vælg lokationstype'})
    .min(1, {message: 'Lokationstype skal vælges'}),
  initial_project_no: z.string({message: 'Projektnummer skal udfyldes'}),
});

const defaultEditLocationSchema = baseLocationSchema.extend({
  loc_name: z.string({message: 'Lokationsnavn skal udfyldes'}).min(1, {
    message: 'Lokationsnavn skal være mindst 1 tegn',
  }),
});

const defaultAddLocationSchema = defaultEditLocationSchema;

const boreholeEditLocationSchema = baseLocationSchema.extend({
  boreholeno: z.string().optional(),
  suffix: z.string().optional(),
});

const boreholeAddLocationSchema = boreholeEditLocationSchema;

const baseTimeseriesSchema = z.object({
  sensor_depth_m: z.number().nullish(),
});

const baseAddTimeseriesSchema = baseTimeseriesSchema.extend({
  tstype_id: z.number({required_error: 'Vælg tidsserietype'}).gte(1, {
    message: 'Vælg tidsserietype',
  }),
});

const defaultEditTimeseriesSchema = baseTimeseriesSchema.extend({prefix: z.string().nullish()});

const defaultAddTimeseriesSchema = baseAddTimeseriesSchema.extend({prefix: z.string().nullish()});

const boreholeEditTimeseriesSchema = baseTimeseriesSchema.extend({
  intakeno: z.number({required_error: 'Vælg indtag'}).gte(1, {
    message: 'Vælg indtag',
  }),
});

const boreholeAddTimeseriesSchema = baseAddTimeseriesSchema.extend({
  intakeno: z.number({required_error: 'Vælg indtag'}).gte(0, {
    message: 'Vælg indtag',
  }),
});

const watlevmpAddSchema = z.object({
  elevation: z.number({required_error: 'Målepunkt skal udfyldes'}).nullable(),
  description: z
    .string({required_error: 'Beskrivelse skal udfyldes'})
    .min(3, {message: 'Beskrivelse skal være mindst 3 tegn'}),
});

const addUnitSchema = z.object({
  unit_uuid: z.string(),
  startdate: z.string(),
});

const editUnitSchema = z
  .object({
    unit_uuid: z.string(),
    startdate: z.string().default(() => moment().format('YYYY-MM-DD')),
    enddate: z.string(),
  })
  .superRefine((unit, ctx) => {
    if (moment(unit.startdate) > moment(unit.enddate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: 'start dato må ikke være senere end slut dato',
        path: ['startdate'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: 'slut dato må ikke være tidligere end start datoo',
        path: ['enddate'],
      });
    }
  });

export {
  baseAddTimeseriesSchema,
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
type BaseTimeseries = z.infer<typeof baseTimeseriesSchema>;
type BaseAddTimeseriesSchema = z.infer<typeof baseAddTimeseriesSchema>;
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
  BaseAddTimeseriesSchema,
  BaseLocation,
  BaseTimeseries,
  DefaultEditTimeseries,
  AddUnit,
  EditUnit,
  Watlevmp,
};
