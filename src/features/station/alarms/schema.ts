import {z} from 'zod';

function addIssue(path: string, message: string, ctx: z.RefinementCtx) {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: `${message} (${path === 'from' ? 'fra' : 'til'})`,
    path: [path],
  });
}

export const alarmContactSchema = z
  .object({
    contact_id: z
      .string({invalid_type_error: 'Kontakt ID er påkrævet'})
      .min(1, 'Kontakt er påkrævet'),
    name: z.string(),
    sms: z
      .object({
        selected: z.boolean().default(false),
        to: z.string().nullable(),
        from: z.string().nullable(),
      })
      .superRefine((val, ctx) => {
        if (val?.selected) {
          if (!val.from) {
            addIssue('from', 'SMS interval er påkrævet', ctx);
          }
          if (!val.to) {
            addIssue('to', 'SMS interval er påkrævet', ctx);
          }
        }
      }),
    email: z
      .object({
        selected: z.boolean().default(false),
        to: z.string().nullable(),
        from: z.string().nullable(),
      })
      .superRefine((val, ctx) => {
        if (val?.selected) {
          if (!val.from) {
            addIssue('from', 'Email interval er påkrævet', ctx);
          }
          if (!val.to) {
            addIssue('to', 'Email interval er påkrævet', ctx);
          }
        }
      }),
    call: z
      .object({
        selected: z.boolean().default(false),
        to: z.string().nullable(),
        from: z.string().nullable(),
      })
      .superRefine((val, ctx) => {
        if (val?.selected) {
          if (!val.from) {
            addIssue('from', 'Opkald interval er påkrævet', ctx);
          }
          if (!val.to) {
            addIssue('to', 'Opkald interval er påkrævet', ctx);
          }
        }
      }),
  })
  .superRefine((val, ctx) => {
    if (!val?.sms?.selected && !val?.email?.selected && !val?.call?.selected) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mindst én kontaktmetode skal være valgt',
        path: ['root'],
      });
    }
  });

const contactArray = z.object({
  contacts: z.array(alarmContactSchema),
});

const alarmNotificationArray = z.object({
  notification_ids: z.array(z.number()),
});
export const alarmsSchema = z.object({
  name: z.string().min(1, 'Navn er påkrævet'),
  group_id: z.string().nullable(),
  ts_id: z.number().nullable(),
  comment: z.string().nullable(),
  notification_ids: alarmNotificationArray.shape.notification_ids,
  contacts: contactArray.shape.contacts.optional(),
});

export type AlarmsFormValues = z.infer<typeof alarmsSchema>;
export type AlarmContactFormType = z.infer<typeof alarmContactSchema>;
