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
        disabled: z.boolean(),
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
        disabled: z.boolean(),
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
        disabled: z.boolean(),
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

const channelLabels = {sms: 'SMS', email: 'Email', call: 'Opkald'} as const;

const dialogChannelSchema = (channel: keyof typeof channelLabels) =>
  z
    .object({
      selected: z.boolean().default(false),
      // Only lives in the dialog - 'all_day' is saved as from === to
      mode: z.enum(['all_day', 'window']).nullable(),
      to: z.string().nullable(),
      from: z.string().nullable(),
      disabled: z.boolean(),
    })
    .superRefine((val, ctx) => {
      if (!val.selected) return;
      if (!val.mode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Vælg hele døgnet eller et tidsrum',
          path: ['mode'],
        });
        return;
      }
      if (val.mode === 'window') {
        if (!val.from) addIssue('from', `${channelLabels[channel]} interval er påkrævet`, ctx);
        if (!val.to) addIssue('to', `${channelLabels[channel]} interval er påkrævet`, ctx);
        if (val.from && val.to && val.from.slice(0, 5) === val.to.slice(0, 5)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Start og slut er ens – vælg 'Hele døgnet' i stedet",
            path: ['to'],
          });
        }
      }
    });

export const alarmContactDialogSchema = z
  .object({
    contact_id: alarmContactSchema.innerType().shape.contact_id,
    name: z.string(),
    sms: dialogChannelSchema('sms'),
    email: dialogChannelSchema('email'),
    call: dialogChannelSchema('call'),
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
export type AlarmContactDialogFormType = z.infer<typeof alarmContactDialogSchema>;
