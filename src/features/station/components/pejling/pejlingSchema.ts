import {z} from 'zod';
import {zodDayjs} from '~/helpers/schemas';

const baseSchema = z.object({
  measurement: z.number().nullable(),
  // timeofmeas: z.string().min(1, 'Tidspunkt skal udfyldes'),
  timeofmeas: zodDayjs('Tidspunkt skal udfyldes'),
  comment: z.string().nullish(),
  useforcorrection: z.coerce.number().default(0),
});

const pejlingSchema = baseSchema;

const pejlingBoreholeSchema = baseSchema
  .extend({
    extrema: z.string().nullish(),
    pumpstop: zodDayjs().nullish(),
    service: z.boolean().nullish().default(false),
  })
  .refine(
    (data) => {
      if (
        data.service === false &&
        data.pumpstop &&
        data.timeofmeas.isSameOrBefore(data.pumpstop)
      ) {
        return false;
      }
      return true;
    },
    {
      path: ['pumpstop'],
      message: 'Pumpestop skal være før pejletidspunkt',
    }
  )
  .transform((data) =>
    data.service
      ? {...data, pumpstop: null}
      : data.pumpstop !== undefined && data.pumpstop !== null
        ? {...data, pumpstop: data.pumpstop}
        : {...data}
  );

type PejlingSchemaType = z.infer<typeof pejlingSchema>;
type PejlingBoreholeSchemaType = z.infer<typeof pejlingBoreholeSchema>;

export type {PejlingSchemaType, PejlingBoreholeSchemaType};
export {pejlingSchema, pejlingBoreholeSchema};
