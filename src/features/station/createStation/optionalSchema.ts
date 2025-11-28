import {z} from 'zod';

const controlSettingsSchema = z.object({
  controls_per_year: z.number({required_error: 'Kontrol interval er påkrævet'}).nullable(),
  // .refine((val) => (val == null ? null : val), 'Kontrol interval skal være et tal'),
  dummy: z.number().nullish().optional(),
  lead_time: z.number({required_error: 'Forvarselstid er påkrævet'}).nullable(),
  selectValue: z.number().default(1),
});

const unitMeasurementSchema = z.object({
  sampleInterval: z
    .number({required_error: 'Måleinterval er påkrævet'})
    .min(1, 'Måleinterval skal være mindst 1 minut'),
  sendInterval: z
    .number({required_error: 'Sendeinterval er påkrævet'})
    .min(1, 'Sendingsinterval skal være mindst 1 minut'),
});

const syncSchema = z
  .object({
    sync_dmp: z.boolean().optional(),
    owner_cvr: z.number().optional(),
    owner_name: z.union([z.string(), z.literal('')]).optional(),
    jupiter: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.sync_dmp) {
        return data.owner_name !== undefined && data.owner_name !== null && data.owner_name !== '';
      }
      return true;
    },
    {
      message: 'Data ejer skal være udfyldt, når DMP synkronisering er aktiveret',
      path: ['owner_name'],
    }
  );

const watlevmpSchema = z.object({
  elevation: z.number({required_error: 'Målepunkt skal udfyldes'}).nullable(),
  description: z
    .string({required_error: 'Beskrivelse skal udfyldes'})
    .min(3, {message: 'Beskrivelse skal være mindst 3 tegn'}),
});

const timeseriesOptionalSchema = z
  .object({
    controlSettings: controlSettingsSchema.optional(),
    watlevmp: watlevmpSchema.optional(),
    unitMeasurement: unitMeasurementSchema.optional(),
    synchronization: syncSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.controlSettings !== undefined) {
      // Now it's REQUIRED → validate missing fields
      const result = controlSettingsSchema.safeParse(data.controlSettings);

      if (!result.success) {
        result.error.issues.forEach((issue) =>
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: issue.message,
            path: ['controlSettings', ...(issue.path ?? [])],
          })
        );
      }
    }
    if (data.unitMeasurement !== undefined) {
      // Now it's REQUIRED → validate missing fields
      const result = unitMeasurementSchema.safeParse(data.unitMeasurement);
      if (!result.success) {
        result.error.issues.forEach((issue) =>
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: issue.message,
            path: ['unitMeasurement', ...(issue.path ?? [])],
          })
        );
      }
    }
    if (data.synchronization !== undefined) {
      // Now it's REQUIRED → validate missing fields
      const result = syncSchema.safeParse(data.synchronization);
      if (!result.success) {
        result.error.issues.forEach((issue) =>
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: issue.message,
            path: ['synchronization', ...(issue.path ?? [])],
          })
        );
      }
    }
    if (data.watlevmp !== undefined) {
      // Now it's REQUIRED → validate missing fields
      const result = watlevmpSchema.safeParse(data.watlevmp);
      if (!result.success) {
        result.error.issues.forEach((issue) =>
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: issue.message,
            path: ['watlevmp', ...(issue.path ?? [])],
          })
        );
      }
    }
  });

type TimeseriesOptionalSchema = z.infer<typeof timeseriesOptionalSchema>;

export {timeseriesOptionalSchema};
export type {TimeseriesOptionalSchema};
