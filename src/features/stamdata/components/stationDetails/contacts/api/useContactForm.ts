import {zodResolver} from '@hookform/resolvers/zod';
import {DefaultValues, FieldValues, useForm} from 'react-hook-form';
import {z} from 'zod';

const contactSchema = z.object({
  id: z.string().nullish(),
  name: z.string({required_error: 'Navn på kontakten skal udfyldes'}),
  mobile: z.string().nullish(),
  email: z.union([z.string().email('Det skal være en valid email'), z.literal('')]).nullable(),
  comment: z.string().optional(),
  contact_role: z
    .number()
    .optional()
    .refine((val) => val !== undefined && val !== -1, {
      message: 'Der skal vælges en værdi fra listen',
    }),
  user_id: z.string().nullish(),
  contact_type: z
    .string()
    .optional()
    .refine((val) => val !== undefined && val !== '', {
      message: 'Der skal vælges en værdi fra listen',
    }),
  notify_required: z.boolean().optional().default(false),
});

// const contact_info_table = contactSchema.extend({
//   id: z.string(),
//   relation_id: z.number(),
//   org: z.string(),
//   contact_role_name: z.string(),
// });

export type InferContactInfo = z.infer<typeof contactSchema>;
// export type InferContactTable = z.infer<typeof contact_info_table>;

const contactArraySchema = z.array(contactSchema);

type ContactFormProps<T> = {
  mode: 'add' | 'edit' | 'mass_edit';
  defaultValues: DefaultValues<T> | undefined;
  values?: T;
};

const useContactForm = <T extends FieldValues>({
  mode,
  defaultValues,
  values,
}: ContactFormProps<T>) => {
  const contactFormMethods = useForm<T>({
    resolver: zodResolver(mode !== 'mass_edit' ? contactSchema : contactArraySchema),
    mode: 'onTouched',
    defaultValues: defaultValues,
    values: values,
  });

  return contactFormMethods;
};

export default useContactForm;
