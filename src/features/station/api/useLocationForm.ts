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
      console.log('opts', opts[0]);

      const loctype_id = 'loctype_id' in opts[0] ? opts[0].loctype_id : -1;
      console.log(loctype_id);
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
      const parsed = test.safeParse(opts[0]);

      console.log(parsed);

      return zodResolver(test)(...opts);
    },
    defaultValues,
    mode: 'onTouched',
  });

  return formMethods;
};

export default useLocationForm;
