import {
  baseLocationSchema,
  boreholeAddLocationSchema,
  boreholeEditLocationSchema,
  defaultAddLocationSchema,
  defaultEditLocationSchema,
} from '../schema';
import {zodResolver} from '@hookform/resolvers/zod';
import {DefaultValues, useForm, UseFormReturn} from 'react-hook-form';
import {ZodType} from 'zod';

type useLocationFormProps<T> = {
  schema?: ZodType<T>;
  defaultValues?: DefaultValues<T>;
  mode?: 'Add' | 'Edit';
};

const useLocationForm = <T extends Record<string, any>>({
  defaultValues,
  mode,
  schema,
}: useLocationFormProps<T>): UseFormReturn<T> => {
  const formMethods = useForm<T>({
    resolver: (...opts) => {
      let test: ZodType<any> = baseLocationSchema;
      if (schema) return zodResolver(schema)(...opts);

      const loctype_id = 'loctype_id' in opts[0] ? opts[0].loctype_id : -1;
      if (loctype_id !== -1 && loctype_id !== 9) {
        if (mode === 'Add') {
          test = defaultAddLocationSchema;
        } else if (mode === 'Edit') {
          test = defaultEditLocationSchema;
        }
      }

      if (loctype_id == 9) {
        if (mode === 'Add') {
          test = boreholeAddLocationSchema;
        } else if (mode === 'Edit') {
          test = boreholeEditLocationSchema;
        }
      }

      return zodResolver(test)(...opts);
    },
    defaultValues,
    mode: 'onTouched',
  });

  return formMethods;
};

export default useLocationForm;
