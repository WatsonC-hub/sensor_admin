import React, {useEffect, useMemo} from 'react';
import {ActivitySchemaType} from './types';
import {useActivityOptions} from './activityQueries';
import {z} from 'zod';
import {FormProvider, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import FormInput from '~/components/FormInput';

type Props = {
  ts_id: number | undefined;
  flag_ids: number[];
  defaultValues?: ActivitySchemaType['flags'];
  onValid: (value: ActivitySchemaType['flags']) => void;
  setValid: (value: boolean) => void;
};

const ActivityFlagForm = ({ts_id, defaultValues, flag_ids, onValid, setValid}: Props) => {
  const {data: options} = useActivityOptions(ts_id);

  const schema = useMemo(() => {
    const schema = z.object({});

    flag_ids.forEach((id) => {
      const option = options?.find((option) => option.id == id);
      if (option == undefined) return;
      if (option.input_type == 'null') return;

      if (option.input_type === 'number') {
        //@ts-expect-error zod types are not correct
        schema.shape[id] = z.number({message: 'Skal være et tal'});
      } else if (option.input_type === 'text' || option.input_type == 'textarea') {
        //@ts-expect-error zod types are not correct
        schema.shape[id] = z.string().min(3, {message: 'Skal være minimum 3 karakterer'});
      }
    });

    return schema;
  }, [flag_ids]);

  const formMethods = useForm<ActivitySchemaType['flags']>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
    mode: 'onTouched',
  });

  const {
    getValues,
    formState: {isValid, isValidating},
  } = formMethods;

  useEffect(() => {
    setValid(isValid);
    if (isValid) onValid(getValues());
  }, [isValidating, isValid]);

  return (
    <FormProvider {...formMethods}>
      {flag_ids.map((id) => {
        const option = options?.find((option) => option.id == id);
        if (option == undefined || option.input_type == 'null') return;
        return (
          <FormInput
            key={id}
            label={option.label}
            name={id.toString()}
            type={option.input_type == 'number' ? 'number' : undefined}
            {...(option.input_type == 'textarea'
              ? {
                  multiline: true,
                  rows: 3,
                }
              : {})}
          />
        );
      })}
    </FormProvider>
  );
};

export default ActivityFlagForm;
