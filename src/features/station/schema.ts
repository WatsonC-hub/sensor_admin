import moment from 'moment';
import {z} from 'zod';

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
    watlevmp: z
      .object({
        startdate: z.string().optional(),
        elevation: z.number({required_error: 'Målepunkt skal udfyldes'}).nullable(),
        description: z
          .string({required_error: 'Beskrivelse skal udfyldes'})
          .min(3, {message: 'Beskrivelse skal være mindst 3 tegn'}),
      })
      .optional(),
  }),
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
export const defaultSchema = mutualPropertiesSchema.extend({
  location: mutualPropertiesSchema.shape.location.extend({
    loctype_id: z.number(),
    loc_name: z.string().min(1, 'Lokationsnavn skal udfyldes'),
  }),
});

type dynamicSchemaType = z.infer<
  typeof defaultSchema | typeof DGUSchema | typeof mutualPropertiesSchema
>;

export type {dynamicSchemaType};
