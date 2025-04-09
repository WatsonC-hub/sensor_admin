import {z} from 'zod';

const mutualPropertiesSchema = z.object({
  location: z.object({
    description: z.string().optional(),
    x: z.number({required_error: 'X-koordinat skal udfyldes'}),
    y: z.number({required_error: 'Y-koordinat skal udfyldes'}),
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

type dynamicSchemaType = z.infer<typeof defaultSchema | typeof DGUSchema>;

export type {dynamicSchemaType};
