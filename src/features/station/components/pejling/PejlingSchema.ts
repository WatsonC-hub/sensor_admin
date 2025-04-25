import {z} from 'zod';

const pejlingSchema = z.object({
  measurement: z.number().nullable(),
  timeofmeas: z.string().min(1, 'Tidspunkt skal udfyldes'),
  comment: z.string().optional(),
  notPossible: z.boolean().optional(),
  useforcorrection: z.number().default(0),
});

const pejlingBoreholeSchema = z
  .object({
    timeofmeas: z.string().min(1, 'Tidspunkt skal udfyldes'),
    disttowatertable_m: z.number().nullable(),
    extrema: z.string().optional(),
    pumpstop: z.string().optional(),
    service: z.boolean().optional(),
    useforcorrection: z.number().default(0),
    comment: z.string().optional(),
    notPossible: z.boolean().default(false).optional(),
  })
  .refine(
    (data) => {
      if (data.notPossible === false) {
        return data.disttowatertable_m === null;
      }
      return true;
    },
    {
      path: ['disttowatertable_m'],
      message: 'Dist. til vandspejl skal udfyldes',
    }
  );

type PejlingItem = z.infer<typeof pejlingSchema>;
type PejlingBoreholeItem = z.infer<typeof pejlingBoreholeSchema>;

export type {PejlingItem, PejlingBoreholeItem};
export {pejlingSchema, pejlingBoreholeSchema};
