import {ZodType} from 'zod';
import {
  baseTimeseriesSchema,
  boreholeAddTimeseriesSchema,
  boreholeEditTimeseriesSchema,
  defaultAddTimeseriesSchema,
  defaultEditTimeseriesSchema,
} from '../schema';
import {zodResolver} from '@hookform/resolvers/zod';
import {DefaultValues, useForm} from 'react-hook-form';

type useTimeseriesFormProps<T> = {
  schema?: ZodType<T>;
  defaultValues?: DefaultValues<T>;
  mode?: 'Add' | 'Edit';
  loctype_id?: number;
};

const useTimeseriesForm = <T extends Record<string, any>>({
  defaultValues,
  loctype_id,
  mode,
  schema,
}: useTimeseriesFormProps<T>) => {
  const formMethods = useForm({
    resolver: (...opts) => {
      let selectedSchema = baseTimeseriesSchema;
      if (schema) return zodResolver(schema)(...opts);

      console.log('opts', opts[0]);

      if (loctype_id !== -1 && loctype_id !== 9) {
        if (mode === 'Add') {
          selectedSchema = defaultAddTimeseriesSchema;
        } else if (mode === 'Edit') {
          selectedSchema = defaultEditTimeseriesSchema;
        }
      }

      if (loctype_id == 9) {
        if (mode === 'Add') {
          selectedSchema = boreholeAddTimeseriesSchema;
        } else if (mode === 'Edit') {
          selectedSchema = boreholeEditTimeseriesSchema;
        }
      }

      const parsed = selectedSchema.safeParse(opts[0]);

      console.log(parsed);

      return zodResolver(selectedSchema)(...opts);
    },
    defaultValues,
    mode: 'onTouched',
  });

  return formMethods;
};

export default useTimeseriesForm;
