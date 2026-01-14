import React from 'react';
import {activitySchema, ActivitySchemaType} from './types';
import {createTypedForm} from '~/components/formComponents/Form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {useShowFormState} from '~/hooks/useQueryStateParameters';
import {Box, Card, Grid2, Typography} from '@mui/material';

const Form = createTypedForm<ActivitySchemaType>();

interface ActivityFormProps {
  initialData: ActivitySchemaType | (() => ActivitySchemaType);
}

const ActivityForm = ({initialData}: ActivityFormProps) => {
  const {data: activityData} = activitySchema.safeParse(
    typeof initialData === 'function' ? initialData() : initialData
  );
  const [, setShowForm] = useShowFormState();

  const formMethods = useForm<ActivitySchemaType>({
    resolver: zodResolver(activitySchema),
    defaultValues: activityData,
    mode: 'onTouched',
  });

  console.log('formValues:', formMethods.getValues());

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
            {value: true, label: 'Tidsserie'},
          ]}
        />
        <Form.Autocomplete<{id: number; label: string}, true>
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
          options={[
            {
              id: 1,
              label: 'Vedligeholdelse',
            },
            {
              id: 2,
              label: 'test',
            },
            {
              id: 3,
              label: 'test2',
            },
          ]}
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
          <Form.Submit submit={(values) => console.log(values)} />
        </Grid2>
      </Card>
    </Form>
  );
};

export default ActivityForm;
