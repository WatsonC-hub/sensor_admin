import {zodResolver} from '@hookform/resolvers/zod';
import {DefaultValues, useForm} from 'react-hook-form';
import {ZodTypeAny} from 'zod';
import {addUnitSchema, editAddUnitSchema} from '../schema';

type UseUnitFormProps<T> = {
  schema?: ZodTypeAny;
  defaultValues?: DefaultValues<T>;
  mode?: 'Add' | 'Edit';
  values?: T;
};

function useUnitForm<T extends Record<string, any>>({
  defaultValues,
  mode,
  schema,
  values,
}: UseUnitFormProps<T>) {
  const formMethods = useForm({
    resolver: (...opts) => {
      if (schema) return zodResolver(schema)(...opts);

      if (mode === 'Add') {
        return zodResolver(addUnitSchema)(...opts);
      }

      return zodResolver(editAddUnitSchema)(...opts);
    },
    defaultValues,
    mode: 'onTouched',
    values,
  });

  return formMethods;
}

export default useUnitForm;
