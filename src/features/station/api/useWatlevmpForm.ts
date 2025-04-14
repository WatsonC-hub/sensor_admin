import {zodResolver} from '@hookform/resolvers/zod';
import {DefaultValues, useForm} from 'react-hook-form';
import {ZodType} from 'zod';
import {watlevmpAddSchema} from '../schema';

type UseWatlevmpFormProps<T> = {
  schema?: ZodType<T>;
  defaultValues?: DefaultValues<T>;
};

const useWatlevmpForm = <T extends Record<string, any>>({
  defaultValues,
  schema,
}: UseWatlevmpFormProps<T>) => {
  const formMethods = useForm({
    resolver: (...opts) => {
      if (schema) return zodResolver(schema)(...opts);

      return zodResolver(watlevmpAddSchema)(...opts);
    },
    defaultValues,
  });

  return formMethods;
};

export default useWatlevmpForm;
