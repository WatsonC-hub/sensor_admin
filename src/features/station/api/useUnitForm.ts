import {zodResolver} from '@hookform/resolvers/zod';
import {DefaultValues, FieldValues, useForm} from 'react-hook-form';
import {z, ZodObject} from 'zod';
import {addUnitSchema, editAddUnitSchema} from '../schema';

type UseUnitFormProps<TSchema extends ZodObject<any>> = {
  schema: TSchema;
  defaultValues?: DefaultValues<z.input<TSchema>>;
  values?: z.input<TSchema>;
};

function useUnitForm<TSchema extends ZodObject<any>>({
  defaultValues,
  schema,
  values,
}: UseUnitFormProps<TSchema>) {
  const formMethods = useForm<z.input<TSchema>, any, z.output<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
    values,
  });

  return formMethods;
}

export default useUnitForm;
