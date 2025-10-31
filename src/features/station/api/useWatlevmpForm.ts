import {zodResolver} from '@hookform/resolvers/zod';
import {DefaultValues, useForm} from 'react-hook-form';
import {ZodType} from 'zod';

type UseWatlevmpFormProps<T> = {
  schema: ZodType<T>;
  defaultValues?: DefaultValues<T>;
  context?: Record<string, any>;
};

const useWatlevmpForm = <T extends Record<string, any>>({
  defaultValues,
  schema,
  context,
}: UseWatlevmpFormProps<T>) => {
  const formMethods = useForm({
    resolver: (...opts) => {
      const context = opts[1];
      console.log(context);

      if (context && context.required === false) return zodResolver(schema.optional())(...opts);

      return zodResolver(schema)(...opts);
    },
    defaultValues,
    mode: 'onTouched',
    context,
  });

  return formMethods;
};

export default useWatlevmpForm;
