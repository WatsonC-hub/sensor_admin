import moment from 'moment';
import {z} from 'zod';

const baseSchema = z.object({
  measurement: z.number().nullable(),
  timeofmeas: z.string().min(1, 'Tidspunkt skal udfyldes'),
  comment: z.string().optional(),
  useforcorrection: z
    .number()
    .default(0)
    .transform((val) => Number(val)),
});

const pejlingSchema = baseSchema;

const pejlingBoreholeSchema = baseSchema
  .extend({
    extrema: z.string().nullish(),
    pumpstop: z.string().nullish(),
    service: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.pumpstop && data.pumpstop > data.timeofmeas) {
        return false;
      }
      return true;
    },
    {
      path: ['pumpstop'],
      message: 'Pumpestop skal være før pejletidspunkt',
    }
  )
  // .transform((data) => (data.notPossible ? {...data, measurement: null} : data))
  .transform((data) =>
    data.service
      ? {...data, pumpstop: null}
      : data.pumpstop !== undefined && data.pumpstop !== null
        ? {...data, pumpstop: moment(data.pumpstop).toISOString()}
        : {...data}
  );

type PejlingSchemaType = z.infer<typeof pejlingSchema>;
type PejlingBoreholeSchemaType = z.infer<typeof pejlingBoreholeSchema>;

export type {PejlingSchemaType, PejlingBoreholeSchemaType};
export {pejlingSchema, pejlingBoreholeSchema};
