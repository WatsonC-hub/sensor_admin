import React from 'react';
import {ActivityOption, activitySchema, ActivitySchemaType} from './types';
import {createTypedForm} from '~/components/formComponents/Form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {useShowFormState} from '~/hooks/useQueryStateParameters';
import {Box, Card, Grid2, Typography} from '@mui/material';
import {useActivityOptions, useActivityPost} from './activityQueries';

const Form = createTypedForm<ActivitySchemaType>();

interface ActivityFormProps {
  loc_id: number;
  ts_id?: number;
  initialData: ActivitySchemaType | (() => ActivitySchemaType);
}

const ActivityForm = ({loc_id, ts_id, initialData}: ActivityFormProps) => {
  const {data: activityData} = activitySchema.safeParse(
    typeof initialData === 'function' ? initialData() : initialData
  );
  const [, setShowForm] = useShowFormState();

  const {data: options} = useActivityOptions(ts_id);

  const mutation = useActivityPost();

  const formMethods = useForm<ActivitySchemaType>({
    resolver: zodResolver(activitySchema),
    defaultValues: activityData,
    mode: 'onTouched',
  });

  const onSubmit = (values: ActivitySchemaType) => {
    mutation.mutate({
      comment: values.comment,
      created_at: values.created_at,
      flag_ids: values.flag_ids,
      id: values.id,
      loc_id: values.onTimeseries ? undefined : loc_id,
      ts_id: values.onTimeseries ? ts_id : undefined,
    });
  };

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
          {activityData?.id === -1 ? 'Tilføj aktivitet' : 'Rediger aktivitet'}
        </Typography>
        <Form.DateTime gridSizes={{xs: 12}} name="created_at" label="Dato" />
        <Form.Radio
          gridSizes={{xs: 12}}
          name="onTimeseries"
          label={<Typography>Knyt til</Typography>}
          options={[
            {value: false, label: 'Lokation'},
            {value: true, label: 'Tidsserie', disabled: ts_id === undefined},
          ]}
        />
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
        <Form.Input
          gridSizes={{xs: 12}}
          name="comment"
          label="Kommentar"
          multiline
          rows={4}
          fullWidth
        />
        <Grid2 size={12} sx={{alignSelf: 'end'}} display="flex" gap={1} justifyContent="flex-end">
          <Form.Cancel
            cancel={() => {
              setShowForm(null);
            }}
          />
          <Form.Submit submit={onSubmit} />
        </Grid2>
      </Card>
    </Form>
  );
};

export default ActivityForm;
