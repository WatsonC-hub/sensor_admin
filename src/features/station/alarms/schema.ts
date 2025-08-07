import {z} from 'zod';

const alarmContactSchema = z
  .object({
    contact_id: z.string().optional(),
    name: z.string().optional(),
    sms: z.boolean().default(false),
    email: z.boolean().default(false),
    call: z.boolean().default(false),
  })
  .refine((contact) => contact.contact_id !== undefined && contact.contact_id !== '', {
    path: ['contact_id'],
    message: 'Kontakt er påkrævet',
  });

const criteria = z.object({
  id: z.number().int().optional(),
  name: z.string(),
  selected: z.boolean().default(false),
  category: z.string(),
  sms: z.boolean().default(false),
  email: z.boolean().default(false),
  call: z.boolean().default(false),
});
// .refine((criteria) => criteria.criteria !== undefined, {
//   path: ['criteria'],
//   message: 'Kriterium er påkrævet',
// })
// .refine((criteria) => criteria.name !== '', {
//   path: ['name'],
//   message: 'Vælg et niveau',
// });

const contactArray = z.object({
  contacts: z.array(alarmContactSchema),
});

const alarmCriteriaArray = z.object({
  criteria: z.array(criteria),
});

export const alarmsSchema = z
  .object({
    name: z.string().min(1, 'Navn er påkrævet'),
    from: z.string().min(1, 'start interval er påkrævet'),
    to: z.string().min(1, 'slut interval er påkrævet'),
    comment: z.string().optional(),
    signal_warning: z.boolean(),
    criteria: alarmCriteriaArray.shape.criteria,
    contacts: contactArray.shape.contacts.optional(),
    interval: z.number({required_error: 'Alarm interval er påkrævet'}),
  })
  .refine((data) => data.from < data.to, {
    path: ['to'],
    message: 'slut interval skal være større end start interval',
  });

export type AlarmsFormValues = z.infer<typeof alarmsSchema>;
export type AlarmContactArrayFormValues = z.infer<typeof contactArray>;
export type AlarmCriteriaArrayFormValues = z.infer<typeof alarmCriteriaArray>;
