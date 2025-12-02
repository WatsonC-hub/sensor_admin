import {z} from 'zod';

import {AccessType} from '~/helpers/EnumHelper';

const adgangsforhold = z
  .object({
    id: z.number().nullish(),
    type: z
      .string({required_error: 'En type skal vælges ud fra listen'})
      .refine((val) => val !== '', {
        message: 'En type skal vælges ud fra listen',
      }),
    navn: z.string({required_error: 'Feltet skal udfyldes'}).min(1, 'Feltet skal udfyldes'),
    contact_id: z.string().nullish(),
    placering: z.string().optional().nullish(),
    koden: z.string().optional().nullish(),
    kommentar: z
      .string()
      .optional()
      .transform((value) => value ?? ''),
  })
  .refine(
    ({placering, koden, type}) => {
      if (type == AccessType.Key) {
        return placering !== '';
      }
      if (type == AccessType.Code) {
        return koden !== '';
      }
    },
    ({type}) => {
      if (type !== '-1' && type === AccessType.Key)
        return {
          message: 'Udleveres på adresse felt skal udfyldes',
          path: ['placering'],
        };
      else
        return {
          message: 'Kode feltet skal udfyldes',
          path: ['koden'],
        };
    }
  );

const adgangsforhold_table = z.object({
  id: z.number(),
  type: z
    .string({required_error: 'En type skal vælges ud fra listen'})
    .min(3, 'En type skal vælges ud fra listen'),
  navn: z.string().min(1, 'Feltet skal udfyldes'),
  contact_id: z.string().min(1, 'Feltet skal udfyldes'),
  placering: z.string(),
  koden: z.string(),
  kommentar: z
    .string()
    .optional()
    .transform((value) => value ?? ''),
  contact_name: z.string().optional(),
});

const ressourcer = z
  .array(
    z.object({
      id: z.number(),
      navn: z.string(),
      kategori: z.string(),
      tstype_id: z
        .number()
        .array()
        .nullable()
        .transform((array) => array ?? []),
      loctype_id: z
        .number()
        .array()
        .nullable()
        .transform((array) => array ?? []),
      forudvalgt: z.boolean(),
    })
  )
  .nullish()
  .transform((ressourcer) => ressourcer ?? []);

type AdgangsForhold = z.infer<typeof adgangsforhold>;
type AdgangsforholdTable = z.infer<typeof adgangsforhold_table>;

export {adgangsforhold, ressourcer};
export type {AdgangsForhold, AdgangsforholdTable};
