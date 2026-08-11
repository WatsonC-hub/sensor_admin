import {zodResolver} from '@hookform/resolvers/zod';
import {DefaultValues, useForm} from 'react-hook-form';
import {ZodTypeAny} from 'zod';
import {addUnitSchema, editAddUnitSchema} from '../schema';

type UseUnitFormProps<T> = {
  schema?: ZodTypeAny;
  defaultValues?: DefaultValues<T>;
  mode?: 'Add' | 'Edit';
  values?: T | undefined;
};

function useUnitForm<T extends Record<string, any>>({
  defaultValues,
  mode,
  schema,
  values,
}: UseUnitFormProps<T>) {
  const formMethods = useForm({
    resolver: zodResolver(schema ?? (mode === 'Add' ? addUnitSchema : editAddUnitSchema)),
    defaultValues,
    mode: 'onTouched',
    values,
  });

  return formMethods;
}

export default useUnitForm;
