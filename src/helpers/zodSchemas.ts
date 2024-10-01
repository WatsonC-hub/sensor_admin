import moment from 'moment';
import {z} from 'zod';

const locationSchema = z.object({
  location: z.object({
    loc_id: z.number().optional(),
    loc_name: z.string().min(1, 'Lokationsnavn skal udfyldes'),
    mainloc: z.string().nullish(),
    subloc: z.string().nullish(),
    subsubloc: z.string().nullish(),
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
    initial_project_no: z.string().nullable(),
  }),
});

const timeseriesSchema = locationSchema.extend({
  timeseries: z.object({
    prefix: z.string().nullish(),
    sensor_depth_m: z.number().nullish(),
    tstype_id: z.number(),
  }),
});

const metadataBaseSchema = timeseriesSchema.extend({
  unit: z.object({
    unit_uuid: z.string(),
    startdate: z.string(),
  }),
});

const metadataSchema = metadataBaseSchema.extend({
  timeseries: metadataBaseSchema.shape.timeseries.extend({
    tstype_id: z.number({required_error: 'Vælg tidsserietype'}).gte(1, {
      message: 'Vælg tidsserietype',
    }),
  }),

  watlevmp: z
    .object({
      startdate: z.string().optional(),
      elevation: z.number({required_error: 'Målepunkt skal udfyldes'}),
      description: z
        .string({required_error: 'Beskrivelse skal udfyldes'})
        .min(3, {message: 'Beskrivelse skal være mindst 3 tegn'}),
    })
    .optional(),
});

const metadataPutSchema = metadataBaseSchema.extend({
  timeseries: metadataBaseSchema.shape.timeseries.extend({
    tstype_id: z.number({required_error: 'Vælg tidsserietype'}),
  }),
  unit: metadataBaseSchema.shape.unit
    .extend({
      gid: z.number().optional(),
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

// const metadataSchema = z.object({
//   location: z.object({
//     loc_id: z.number().optional(),
//     loc_name: z
//       .string({required_error: 'Lokationsnavn skal udfyldes'})
//       .min(6, {message: 'Lokationsnavn skal være mindst 6 tegn'}),
//     mainloc: z.string().nullish(),
//     subloc: z.string().nullish(),
//     subsubloc: z.string().nullish(),
//     x: z.number({required_error: 'X-koordinat skal udfyldes'}),
//     y: z.number({required_error: 'Y-koordinat skal udfyldes'}),
//     terrainqual: z.enum(['dGPS', 'DTM', '']).nullish(),
//     terrainlevel: z.number().nullish(),
//     description: z.string().nullish(),
//     loctype_id: z.number().min(1, {message: 'Vælg lokationstype'}),
//   }),
//   timeseries: z.object({

//     prefix: z.string().nullish(),
//     tstype_id: z.number({required_error: 'Vælg tidsserietype'}),
//     sensor_depth_m: z.number().nullish(),
//   }),
//   unit: z
//     .object({
//       unit_uuid: z.string().uuid(),
//       startdate: z.string(),
//     })
//     .optional(),
//   watlevmp: z
//     .object({
//       elevation: z.number({required_error: 'Målepunkt skal udfyldes'}),
//       description: z
//         .string({required_error: 'Beskrivelse skal udfyldes'})
//         .min(3, {message: 'Beskrivelse skal være mindst 3 tegn'}),
//     })
//     .optional(),
// });

export {locationSchema, timeseriesSchema, metadataPutSchema, metadataSchema};
