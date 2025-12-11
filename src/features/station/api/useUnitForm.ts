import {zodResolver} from '@hookform/resolvers/zod';
import {DefaultValues, useForm} from 'react-hook-form';
import {ZodType} from 'zod';
import {addUnitSchema, editAddUnitSchema} from '../schema';

type UseUnitFormProps<T> = {
  schema?: ZodType<T>;
  defaultValues?: DefaultValues<T>;
  mode?: 'Add' | 'Edit';
};

function useUnitForm<T extends Record<string, any>>({
  defaultValues,
  mode,
  schema,
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
  });

  return formMethods;
}

export default useUnitForm;
