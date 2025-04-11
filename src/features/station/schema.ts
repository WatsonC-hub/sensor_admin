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
  x: z.number({required_error: 'X-koordinat skal udfyldes'}),
  y: z.number({required_error: 'Y-koordinat skal udfyldes'}),
  terrainqual: z.enum(['dGPS', 'DTM', '']).nullish(),
  terrainlevel: z.number().nullish(),
  description: z.string().nullish(),
  loctype_id: z.number().min(1, {message: 'Vælg lokationstype'}),
  initial_project_no: z.string().nullish(),
});

const defaultEditLocationSchema = baseLocationSchema.extend({
  loc_name: z
    .string({required_error: 'Lokationsnavn skal udfyldes'})
    .min(1, 'Lokationsnavn skal udfyldes'),
});

const defaultAddLocationSchema = defaultEditLocationSchema;

const boreholeEditLocationSchema = baseLocationSchema.extend({
  loctype_id: z.literal(9),
  suffix: z.string().optional(),
});

const boreholeAddLocationSchema = boreholeEditLocationSchema.extend({
  boreholeno: z.string(),
});

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
  intakeno: z.number(),
});

const boreholeAddTimeseriesSchema = baseAddTimeseriesSchema.extend({
  intakeno: z.number(),
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

const editUnitSchema = z.object({
  unit_uuid: z.string(),
  startdate: z.string(),
  enddate: z.string(),
});

export const mutualPropertiesSchema = z.object({
  location: z.object({
    loctype_id: z.number().default(-1),
    description: z.string().optional(),
    x: z.number({required_error: 'X-koordinat skal udfyldes'}).optional(),
    y: z.number({required_error: 'Y-koordinat skal udfyldes'}).optional(),
    terrainQuote: z.number().nullish(),
    terrainQuality: z.enum(['dGPS', 'DTM', '']).optional(),
    loc_id: z.number().optional(),
    groups: z
      .array(
        z.object({
          id: z.string(),
          group_name: z.string(),
        })
      )
      .nullish(),
    initial_project_no: z.string().nullish(),
  }),
  timeseries: z.object({
    prefix: z.string().nullish(),
    sensor_depth_m: z.number().nullish(),
    tstype_id: z.number({required_error: 'Vælg tidsserietype'}).gte(1, {
      message: 'Vælg tidsserietype',
    }),
  }),
  watlevmp: z
    .object({
      startdate: z.string().optional(),
      elevation: z.number({required_error: 'Målepunkt skal udfyldes'}).nullable(),
      description: z
        .string({required_error: 'Beskrivelse skal udfyldes'})
        .min(3, {message: 'Beskrivelse skal være mindst 3 tegn'}),
    })
    .optional(),
  unit: z
    .object({
      gid: z.number().optional(),
      unit_uuid: z.string(),
      startdate: z.string(),
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
    }),
});

export const DGUSchema = mutualPropertiesSchema.extend({
  location: mutualPropertiesSchema.shape.location.extend({
    loctype_id: z.literal(9),
    DGU_id: z.number().optional(),
    DGU_name: z.string().min(1, 'DGU-navn skal udfyldes'),
    DGU_type: z.enum(['Borehul', 'Brønd', 'Kilde', 'Overfladevand', 'Andet']),
  }),
});

export const defaultSchema = mutualPropertiesSchema
  .extend({
    location: mutualPropertiesSchema.shape.location.extend({
      loctype_id: z.number(),
      loc_name: z.string().min(1, 'Lokationsnavn skal udfyldes'),
    }),
  })
  .refine((data) => {
    if (data.timeseries.tstype_id === 1) {
      return data.watlevmp !== undefined;
    }
  });

type dynamicSchemaType = z.infer<
  typeof defaultSchema | typeof DGUSchema | typeof mutualPropertiesSchema
>;

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

export type {dynamicSchemaType};
