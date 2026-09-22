import React, {useMemo} from 'react';
import {ActivityOption, activitySchema, ActivitySchemaType, flagEntrySchema} from './types';
import {createTypedForm} from '~/components/formComponents/Form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {useShowFormState} from '~/hooks/useQueryStateParameters';
import {Box, Card, Divider, Grid2, Typography} from '@mui/material';
import {useActivityOptions, useActivityPost} from './activityQueries';
import {z} from 'zod';

import ActivityFlagForm from './ActivityFlagForm';

const Form = createTypedForm<ActivitySchemaType>();

interface ActivityFormProps {
  loc_id: number;
  ts_id?: number;
  initialData: ActivitySchemaType;
  values?: ActivitySchemaType;
}

const ActivityForm = ({loc_id, ts_id, initialData, values}: ActivityFormProps) => {
  const [, setShowForm] = useShowFormState();


  const {data: options} = useActivityOptions(ts_id);

  const mutation = useActivityPost();

  const schema = useMemo(() => {
    return activitySchema.extend({
      flags: z.array(flagEntrySchema).superRefine((flags, ctx) => {
        flags.forEach((flag, index) => {
          const option = options?.find((o) => o.id === flag.id);
          if (!option || option.input_type === 'null') return;

          if (option.input_type === 'number' && typeof flag.value !== 'number') {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Skal være et tal',
              path: [index, 'value'],
            });
          }

          if (
            (option.input_type === 'text' || option.input_type === 'textarea') &&
            (typeof flag.value !== 'string' || flag.value.length < 3)
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Skal være minimum 3 karakterer',
              path: [index, 'value'],
            });
          }
        });
      }),
    });
  }, [options]);

  const formMethods = useForm<ActivitySchemaType>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
    values: values,
    mode: 'onTouched',
  });

  const {
    watch,
    control,
    formState: {isValid, isDirty},
  } = formMethods;


  console.log(values !== undefined && isValid);

  const onSubmit = (values: ActivitySchemaType) => {
    mutation.mutate(
      {
        created_at: values.created_at,
        flags: Object.fromEntries(values.flags.map(({id, value}) => [id, value])),
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

        <ActivityFlagForm ts_id={ts_id} flag_ids={flag_ids} control={control} />

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
          <Form.Submit submit={onSubmit} disabled={values !== undefined && (!isValid || !isDirty)} />
        </Grid2>
      </Card>
    </Form>
  );
};

export default ActivityForm;
