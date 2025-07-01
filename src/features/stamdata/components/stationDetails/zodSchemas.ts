import {z} from 'zod';

import {AccessType} from '~/helpers/EnumHelper';

const contact_info = z.object({
  id: z.string().nullish(),
  navn: z.string({required_error: 'Navn på kontakten skal udfyldes'}),
  telefonnummer: z.number().nullish(),
  email: z.union([z.string().email('Det skal være en valid email'), z.literal('')]).nullable(),
  comment: z.string().optional(),
  contact_role: z.number().gt(-1, 'Der skal vælges en værdi fra listen'),
  user_id: z.string().nullish(),
  contact_type: z.string(),
});

const contact_info_table = contact_info.extend({
  id: z.string(),
  relation_id: z.number(),
  org: z.string(),
  contact_role_name: z.string(),
});

const adgangsforhold = z
  .object({
    id: z.number().nullish(),
    type: z
      .string({required_error: 'En type skal vælges ud fra listen'})
      .min(3, 'En type skal vælges ud fra listen'),
    navn: z.string({required_error: 'Feltet skal udfyldes'}).min(1, 'Feltet skal udfyldes'),
    contact_id: z.string().min(1, 'Feltet skal udfyldes').nullish(),
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
type InferContactInfo = z.infer<typeof contact_info>;
type InferContactInfoTable = z.infer<typeof contact_info_table>;

export {contact_info, adgangsforhold, ressourcer};
export type {AdgangsForhold, AdgangsforholdTable, InferContactInfo, InferContactInfoTable};
