import React, {useEffect} from 'react';
import {ActivitySchemaType} from './types';
import {useActivityOptions} from './activityQueries';
import {Control, useFieldArray} from 'react-hook-form';
import FormInput from '~/components/FormInput';

type Props = {
  ts_id: number | undefined;
  flag_ids: number[];
  control: Control<ActivitySchemaType>;
};

const ActivityFlagForm = ({ts_id, flag_ids, control}: Props) => {
  const {data: options} = useActivityOptions(ts_id);

  const {fields, append, remove} = useFieldArray({
    control,
    name: 'flags',
    keyName: '_fieldId', // 'id' is the flag's own id, don't let RHF overwrite it
  });

  // keep the field array in sync with the flag_ids selected in the Autocomplete
  useEffect(() => {
    fields.forEach((field, index) => {
      if (!flag_ids.includes(field.id)) remove(index);
    });

    flag_ids.forEach((id) => {
      if (!fields.some((field) => field.id === id)) {
        append({id, value: null});
      }
    });
  }, [flag_ids]);

  return (
    <>
      {fields.map((field, index) => {
        const option = options?.find((option) => option.id === field.id);
        if (option == undefined || option.input_type === 'null') return null;

        return (
          <FormInput
            key={field._fieldId}
            label={option.label}
            name={`flags.${index}.value`}
            type={option.input_type === 'number' ? 'number' : undefined}
            {...(option.input_type === 'textarea'
              ? {
                  multiline: true,
                  rows: 3,
                }
              : {})}
          />
        );
      })}
    </>
  );
};

export default ActivityFlagForm;
