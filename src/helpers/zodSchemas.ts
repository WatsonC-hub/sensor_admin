import moment from 'moment';
import {z} from 'zod';

// const baseLocationSchema = z.object({
//   groups: z
//     .array(
//       z.object({
//         id: z.string(),
//         group_name: z.string(),
//       })
//     )
//     .nullish(),
//   x: z.number({required_error: 'X-koordinat skal udfyldes'}),
//   y: z.number({required_error: 'Y-koordinat skal udfyldes'}),
//   terrainqual: z.enum(['dGPS', 'DTM', '']).nullish(),
//   terrainlevel: z.number().nullish(),
//   description: z.string().nullish(),
//   loctype_id: z.number().min(1, {message: 'Vælg lokationstype'}),
//   initial_project_no: z.string().nullish(),
// });

// const defaultEditLocationSchema = baseLocationSchema.extend({
//   loc_name: z.string().min(1, 'Lokationsnavn skal udfyldes'),
// });

// const defaultAddLocationSchema = defaultEditLocationSchema.extend({});

// const boreholeEditLocationSchema = baseLocationSchema.extend({
//   suffix: z.string().optional(),
// });

// const boreholeAddLocationSchema = boreholeEditLocationSchema.extend({
//   boreholeno: z.string(),
// });

// const baseTimeseriesSchema = z.object({
//   sensor_depth_m: z.number().nullish(),
// });

// const baseAddTimeseriesSchema = baseTimeseriesSchema.extend({
//   tstype_id: z.number({required_error: 'Vælg tidsserietype'}).gte(1, {
//     message: 'Vælg tidsserietype',
//   }),
// });

// const defaultEditTimeseriesSchema = baseTimeseriesSchema.extend({prefix: z.string().nullish()});

// const defaultAddTimeseriesSchema = baseAddTimeseriesSchema.extend({prefix: z.string().nullish()});

// const boreholeEditTimeseriesSchema = baseTimeseriesSchema.extend({
//   intakeno: z.number(),
// });

// const boreholeAddTimeseriesSchema = baseAddTimeseriesSchema.extend({
//   intakeno: z.number(),
// });

// const watlevmpAddSchema = z.object({
//   elevation: z.number({required_error: 'Målepunkt skal udfyldes'}).nullable(),
//   description: z
//     .string({required_error: 'Beskrivelse skal udfyldes'})
//     .min(3, {message: 'Beskrivelse skal være mindst 3 tegn'}),
// });

// const addUnitSchema = z.object({
//   unit_uuid: z.string(),
//   startdate: z.string(),
// });

const locationSchema = z.object({
  location: z.object({
    loc_id: z.number().optional(),
    loc_name: z.string({message: 'Lokationsnavn skal udfyldes'}).min(1, {
      message: 'Lokationsnavn skal være mindst 1 tegn',
    }),
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
    loctype_id: z
      .number({message: 'Vælg lokationstype'})
      .min(1, {message: 'Lokationstype skal vælges'}),
    initial_project_no: z.string({message: 'Projektnummer skal udfyldes'}),
  }),
});

const timeseriesSchema = locationSchema.extend({
  timeseries: z.object({
    prefix: z.string().nullish(),
    sensor_depth_m: z.number().nullish(),
    tstype_id: z.number(),
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
