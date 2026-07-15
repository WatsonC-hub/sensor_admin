import {zodResolver} from '@hookform/resolvers/zod';
import {DefaultValues, FieldValues, useForm} from 'react-hook-form';
import {z, ZodObject} from 'zod';
import {AccessType} from '~/helpers/EnumHelper';

export const locationAccessSchema = z
  .object({
    id: z.number().nullish(),
    type: z.string({message: 'En type skal vælges ud fra listen'}).refine((val) => val !== '', {
      message: 'En type skal vælges ud fra listen',
    }),
    navn: z.string({message: 'Feltet skal udfyldes'}).min(1, 'Feltet skal udfyldes'),
    contact_id: z.string().nullish(),
    placering: z.string().optional().nullish(),
    koden: z.string().optional().nullish(),
    kommentar: z
      .string()
      .optional()
      .transform((value) => value ?? ''),
  })
  .refine(
    ({placering, type}) => {
      if (type == AccessType.Key) {
        return placering !== '';
      }
    },
    {
      message: 'Udleveres på adresse felt skal udfyldes',
      path: ['placering'],
    }
  )
  .refine(
    ({koden, type}) => {
      if (type == AccessType.Code) {
        return koden !== '';
      }
      return true;
    },
    {
      message: 'Kode feltet skal udfyldes',
      path: ['koden'],
    }
  );

// const locationAccessArraySchema = z.array(locationAccessSchema);

type LocationAccessFormProps<TSchema extends ZodObject<any>> = {
  schema: TSchema;
  defaultValues: DefaultValues<z.input<TSchema>> | undefined;
  values?: z.input<TSchema>;
};

const useLocationAccessForm = <TSchema extends ZodObject<any>>({
  schema,
  defaultValues,
  values,
}: LocationAccessFormProps<TSchema>) => {
  const locationAccessFormMethods = useForm<z.input<TSchema>, any, z.output<TSchema>>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: defaultValues,
    values: values,
  });

  return locationAccessFormMethods;
};

export default useLocationAccessForm;
