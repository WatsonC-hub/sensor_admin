import {zodResolver} from '@hookform/resolvers/zod';
import {DefaultValues, useForm} from 'react-hook-form';
import {z, ZodObject} from 'zod';

export const contactSchema = z.object({
  id: z.string().nullish(),
  name: z.string({message: 'Navn på kontakten skal udfyldes'}),
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

export const contact_info_table = contactSchema.extend({
  id: z.string(),
  relation_id: z.number(),
  org: z.string(),
  contact_role_name: z.string(),
});

export type InferContactInfo = z.infer<typeof contactSchema>;
export type InferContactTable = z.infer<typeof contact_info_table>;

// const contactArraySchema = z.array(contactSchema);

type ContactFormProps<TSchema extends ZodObject<any>> = {
  schema: TSchema;
  defaultValues: DefaultValues<z.input<TSchema>> | undefined;
  values?: z.input<TSchema>;
};

const useContactForm = <Schema extends ZodObject<any>>({
  schema,
  defaultValues,
  values,
}: ContactFormProps<Schema>) => {
  const contactFormMethods = useForm<z.input<Schema>, any, z.output<Schema>>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: defaultValues,
    values: values,
  });

  return contactFormMethods;
};

export default useContactForm;
