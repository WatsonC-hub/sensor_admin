import {zodResolver} from '@hookform/resolvers/zod';
import {DefaultValues, FieldValues, useForm} from 'react-hook-form';
import {z} from 'zod';
import {AccessType} from '~/helpers/EnumHelper';

const locationAccessSchema = z
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

const locationAccessArraySchema = z.array(locationAccessSchema);

type LocationAccessFormProps<T> = {
  mode: 'add' | 'edit' | 'mass_edit';
  defaultValues: DefaultValues<T> | undefined;
  values?: T;
};

const useLocationAccessForm = <T extends FieldValues>({
  mode,
  defaultValues,
  values,
}: LocationAccessFormProps<T>) => {
  const locationAccessFormMethods = useForm<T>({
    resolver: zodResolver(mode !== 'mass_edit' ? locationAccessSchema : locationAccessArraySchema),
    mode: 'onTouched',
    defaultValues: defaultValues,
    values: values,
  });

  return locationAccessFormMethods;
};

export default useLocationAccessForm;
