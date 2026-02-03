import React, {useEffect, useState} from 'react';
import {ActivityOption, activitySchema, ActivitySchemaType} from './types';
import {createTypedForm} from '~/components/formComponents/Form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {useShowFormState} from '~/hooks/useQueryStateParameters';
import {Box, Card, Divider, Grid2, Typography} from '@mui/material';
import {useActivityOptions, useActivityPost} from './activityQueries';

import ActivityFlagForm from './ActivityFlagForm';

const Form = createTypedForm<ActivitySchemaType>();

interface ActivityFormProps {
  loc_id: number;
  ts_id?: number;
  initialData: ActivitySchemaType;
}

const ActivityForm = ({loc_id, ts_id, initialData}: ActivityFormProps) => {
  // const {data: activityData} = activitySchema.safeParse(
  //   typeof initialData === 'function' ? initialData() : initialData
  // );
  const [, setShowForm] = useShowFormState();
  const [activityFlagFormValid, setActivityFlagFormValid] = useState(true);

  const {data: options} = useActivityOptions(ts_id);

  const mutation = useActivityPost();

  const formMethods = useForm<ActivitySchemaType>({
    resolver: zodResolver(activitySchema),
    values: initialData,
    mode: 'onTouched',
  });

  const {watch, setValue, getValues} = formMethods;

  const onSubmit = (values: ActivitySchemaType) => {
    mutation.mutate(
      {
        created_at: values.created_at,
        flags: values.flags,
        id: values.id,
        loc_id: loc_id,
      },
      {
        onSuccess: () => {
          setShowForm(null);
        },
      }
    );
  };

  useEffect(() => {
    if (initialData.id) setValue('id', initialData.id, {shouldDirty: true});
  }, [initialData.id]);

  const flag_ids = watch('flag_ids');

  return (
    <Form formMethods={formMethods} gridSizes={12}>
      <Card
        sx={{
          borderRadius: 2.5,
          minWidth: '500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          {initialData.id === '' ? 'Tilføj aktivitet' : 'Rediger aktivitet'}
        </Typography>
        <Form.DateTime gridSizes={{xs: 12}} name="created_at" label="Dato" />
        {/* <Form.Radio
          gridSizes={{xs: 12}}
          name="onTimeseries"
          label={<Typography>Knyt til</Typography>}
          options={[
            {value: false, label: 'Lokation'},
            {value: true, label: 'Tidsserie', disabled: ts_id === undefined},
          ]}
        /> */}
        <Form.Autocomplete<ActivityOption, true>
          gridSizes={{xs: 12}}
          name="flag_ids"
          labelKey="label"
          valueKey="id"
          multiple
          textFieldsProps={{
            label: 'Aktiviteter',
            placeholder: 'Søg blandt muligheder...',
            required: true,
          }}
          options={options || []}
          onChangeCallback={(value) => {
            const ids = value.map((option) => option.id);
            const flags = getValues('flags');
            const newFlags = ids.reduce(
              (acc, id) => {
                acc[id] = flags[id] ?? null; // default value for new keys
                return acc;
              },
              {} as typeof flags
            );
            setValue('flags', newFlags);
          }}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <Box>
                <Typography variant="body1">{option.label}</Typography>
                {option.description && (
                  <Typography variant="body2" color="text.secondary">
                    {option.description}
                  </Typography>
                )}
              </Box>
            </li>
          )}
        />
        <Divider
          sx={{
            width: '100%',
            borderWidth: 1,
            m: 2,
          }}
        />

        <ActivityFlagForm
          ts_id={ts_id}
          defaultValues={initialData.flags}
          flag_ids={flag_ids}
          onValid={(value) => setValue('flags', value, {shouldDirty: true})}
          setValid={setActivityFlagFormValid}
        />

        {/* <Controller
          name="flags"
          control={formMethods.control}
          render={({field: {value: fieldValue, onChange}}) => {
            return (
              <Box display="flex" flexDirection="column" gap={1} width="100%">
                {flag_ids.map((flag) => (
                  <ActivityInput
                    key={flag}
                    option={options?.find((option) => option.id == flag) as ActivityOption}
                    value={fieldValue[flag]}
                    setValue={(value) =>
                      onChange({
                        ...fieldValue,
                        [flag]: value,
                      })
                    }
                  />
                ))}
              </Box>
            );
          }}
        /> */}
        {/* <Form.Input
          gridSizes={{xs: 12}}
          name="comment"
          label="Kommentar"
          multiline
          rows={4}
          fullWidth
        /> */}
        <Grid2 size={12} sx={{alignSelf: 'end'}} display="flex" gap={1} justifyContent="flex-end">
          <Form.Cancel
            cancel={() => {
              setShowForm(null);
            }}
          />
          <Form.Submit submit={onSubmit} disabled={!activityFlagFormValid} />
        </Grid2>
      </Card>
    </Form>
  );
};

export default ActivityForm;
