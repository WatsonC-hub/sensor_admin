import {zodResolver} from '@hookform/resolvers/zod';
import {DefaultValues, useForm} from 'react-hook-form';
import {watlevmpAddSchema} from '../schema';

type UseWatlevmpFormProps<T> = {
  defaultValues?: DefaultValues<T>;
};

const useWatlevmpForm = <T extends Record<string, any>>({
  defaultValues,
}: UseWatlevmpFormProps<T>) => {
  const formMethods = useForm({
    resolver: zodResolver(watlevmpAddSchema),
    defaultValues,
    mode: 'onTouched',
  });

  return formMethods;
};

export default useWatlevmpForm;
