import {zodResolver} from '@hookform/resolvers/zod';
import type {DefaultValues} from 'react-hook-form';
import {useForm} from 'react-hook-form';
import type {z} from 'zod/v4';

type UseUnitFormProps<TSchema extends z.ZodType<any, unknown, any>> = {
  schema: TSchema;
  defaultValues?: DefaultValues<z.input<TSchema>>;
  values?: z.input<TSchema>;
};

function useUnitForm<TSchema extends z.ZodType<any, unknown, any>>({
  defaultValues,
  schema,
  values,
}: UseUnitFormProps<TSchema>) {
  const formMethods = useForm<z.input<TSchema>, unknown, z.output<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
    values,
  });

  return formMethods;
}

export default useUnitForm;
