import {zodResolver} from '@hookform/resolvers/zod';
import {DefaultValues, useForm} from 'react-hook-form';
import {z} from 'zod/v4';

type UseWatlevmpFormProps<TSchema extends z.ZodType<any, unknown, any>> = {
  schema: TSchema;
  defaultValues?: DefaultValues<z.input<TSchema>>;
  values?: z.input<TSchema> | undefined;
};

const useWatlevmpForm = <TSchema extends z.ZodType<any, unknown, any>>({
  schema,
  defaultValues,
  values,
}: UseWatlevmpFormProps<TSchema>) => {
  const formMethods = useForm<z.input<TSchema>, unknown, z.output<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
    values: values,
  });

  return formMethods;
};

export default useWatlevmpForm;
