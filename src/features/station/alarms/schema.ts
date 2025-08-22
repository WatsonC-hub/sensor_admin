import {z} from 'zod';

const alarmContactSchema = z
  .object({
    contact_id: z.string().optional(),
    name: z.string().optional(),
    sms: z
      .object({
        sms: z.boolean().default(false),
        to: z.string().optional(),
        from: z.string().optional(),
      })
      .optional(),
    email: z
      .object({
        email: z.boolean().default(false),
        to: z.string().optional(),
        from: z.string().optional(),
      })
      .optional(),
    call: z
      .object({
        call: z.boolean().default(false),
        to: z.string().optional(),
        from: z.string().optional(),
      })
      .optional(),
  })
  .refine((contact) => contact.contact_id !== undefined && contact.contact_id !== '', {
    path: ['contact_id'],
    message: 'Kontakt er påkrævet',
  });

const contactArray = z.object({
  contacts: z.array(alarmContactSchema),
});

const alarmCriteriaArray = z.object({
  criteria: z.array(z.number().int()),
});

export const alarmsSchema = z.object({
  name: z.string().min(1, 'Navn er påkrævet'),
  groups: z
    .array(
      z.object({
        id: z.string(),
        group_name: z.string(),
      })
    )
    .default([]),
  comment: z.string().optional(),
  criteria: alarmCriteriaArray.shape.criteria,
  contacts: contactArray.shape.contacts.optional(),
});

export type AlarmsFormValues = z.infer<typeof alarmsSchema>;
export type AlarmContactArrayFormValues = z.infer<typeof contactArray>;
export type AlarmContactFormTypeArray = z.infer<typeof contactArray.shape.contacts>;
export type AlarmContactFormType = z.infer<typeof alarmContactSchema>;
export type AlarmCriteriaArrayFormValues = z.infer<typeof alarmCriteriaArray>;
