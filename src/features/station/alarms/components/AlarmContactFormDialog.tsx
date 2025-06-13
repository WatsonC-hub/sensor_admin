import {zodResolver} from '@hookform/resolvers/zod';
import React from 'react';
import {useFieldArray, useForm, useFormContext} from 'react-hook-form';
import {createTypedForm} from '~/components/formComponents/Form';
import {alarmContactSchema, AlarmsFormValues, alarmsSchema} from '../schema';
import Button from '~/components/Button';
import {AddCircle, Delete} from '@mui/icons-material';
import {Box, Grid2} from '@mui/material';
import {z} from 'zod';

const AlarmContactArray = alarmsSchema.shape.contacts;

type AlarmContactArrayValues = z.infer<typeof alarmContactSchema>;
const AlarmContactForm = createTypedForm<AlarmContactArrayValues>();

const AlarmContactFormDialog = () => {
  const {control, getValues} = useFormContext<AlarmContactArrayValues>();
  const alarmContactMethods = useForm<AlarmContactArrayValues>({
    resolver: zodResolver(AlarmContactArray),
  });

  const {fields, append, remove} = useFieldArray<AlarmContactArrayValues>({
    control,
  });

  console.log('getValues', getValues());
  console.log('fields', fields);
  return (
    <AlarmContactForm
      formMethods={alarmContactMethods}
      label="Alarm Contact"
      gridSizes={{xs: 12, sm: 6}}
    >
      {fields.map((field, index) => (
        <Grid2
          container
          key={field.id}
          style={{width: '100%'}}
          spacing={1}
          justifyContent={'space-between'}
        >
          <AlarmContactForm.Input
            name={`${index}.name`}
            label={`Kontakt ${index + 1} Navn`}
            fullWidth
            placeholder="Indtast kontakt navn"
          />
          <AlarmContactForm.Input
            name={`${index}.alarm_interval`}
            label={`Kontakt ${index + 1} Alarm Interval (timer)`}
            fullWidth
            type="number"
            placeholder="Indtast interval i timer"
          />
          <AlarmContactForm.Checkbox
            name={`${index}.sms`}
            label={`SMS`}
            gridSizes={{xs: 12, sm: 2}}
          />
          <AlarmContactForm.Checkbox
            name={`${index}.email`}
            label={`Email`}
            gridSizes={{xs: 12, sm: 2}}
          />
          <AlarmContactForm.Checkbox
            name={`${index}.call`}
            label={`Opkald`}
            gridSizes={{xs: 12, sm: 2}}
          />
          <Grid2 size={{xs: 6, sm: 2}} alignContent={'center'} display="flex">
            <Button
              bttype="tertiary"
              startIcon={<Delete />}
              onClick={() => {
                remove(index);
              }}
            >
              Fjern
            </Button>
          </Grid2>
        </Grid2>
      ))}

      <Box ml={'auto'} display="flex" mt={1}>
        <Button
          bttype="primary"
          startIcon={<AddCircle />}
          onClick={() => {
            append({name: '', sms: false, email: false, call: false, alarm_interval: 0});
          }}
          sx={{ml: 'auto'}}
        >
          Tilføj
        </Button>
      </Box>
    </AlarmContactForm>
  );
};

export default AlarmContactFormDialog;
