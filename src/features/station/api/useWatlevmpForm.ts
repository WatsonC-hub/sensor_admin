import {zodResolver} from '@hookform/resolvers/zod';
import {DefaultValues, useForm} from 'react-hook-form';
import {watlevmpAddSchema} from '../schema';

type UseWatlevmpFormProps<T> = {
  defaultValues?: DefaultValues<T>;
  values: T | undefined;
};

const useWatlevmpForm = <T extends Record<string, any>>({
  defaultValues,
  values,
}: UseWatlevmpFormProps<T>) => {
  const formMethods = useForm<T>({
    resolver: zodResolver(watlevmpAddSchema),
    defaultValues,
    mode: 'onTouched',
    values: values,
  });

  return formMethods;
};

export default useWatlevmpForm;
