import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import {Box, InputAdornment, TextField, Typography} from '@mui/material';
import React from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {z} from 'zod';
import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import {useTimeseriesConfiguration} from '~/features/station/api/useTimeseriesConfiguration';
import {useAppContext} from '~/state/contexts';

const ConfigurationSchema = z.object({
  sampleInterval: z.number().min(1, 'Måleinterval skal være mindst 1 minut'),
  sendInterval: z.number().min(1, 'Sendingsinterval skal være mindst 1 minut'),
});

const Configuration = () => {
  const {ts_id} = useAppContext(['ts_id']);

  const {data} = useTimeseriesConfiguration(ts_id);

  const formMethods = useForm({
    resolver: zodResolver(ConfigurationSchema),
    defaultValues: {
      sampleInterval: data?.savedConfig?.sampleInterval || undefined,
      sendInterval: data?.savedConfig?.sendInterval || undefined,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: {isSubmitting},
  } = formMethods;

  return (
    <Box
      maxWidth={1080}
      sx={{
        borderRadius: 4,
        boxShadow: 3,
        padding: 2,
      }}
      display="flex"
      flexDirection="column"
      gap={1}
    >
      <FormProvider {...formMethods}>
        <Typography variant="h6" gutterBottom>
          Konfiguration
        </Typography>

        <Typography variant="body1" gutterBottom>
          Aktuelle sendeforhold
        </Typography>

        <Box display="flex" flexDirection="row" gap={2} mb={2}>
          <TextField
            type="number"
            label="Måleinterval"
            disabled
            value={data?.currentConfig?.sampleInterval || ''}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="start">minutter</InputAdornment>,
              },
            }}
          />
          <TextField
            type="number"
            label="Sendingsinterval"
            disabled
            value={data?.currentConfig?.sendInterval || ''}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="start">minutter</InputAdornment>,
              },
            }}
          />
        </Box>

        <Typography variant="body1" gutterBottom>
          Gemte sendeforhold
        </Typography>
        <Box display="flex" flexDirection="row" gap={2} mb={2}>
          <FormInput
            name="sampleInterval"
            type="number"
            label="Måleinterval"
            fullWidth={false}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="start">minutter</InputAdornment>,
              },
            }}
          />
          <FormInput
            name="sendInterval"
            type="number"
            label="Sendeinterval"
            fullWidth={false}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="start">minutter</InputAdornment>,
              },
            }}
          />
        </Box>
        <Box display="flex" justifyContent="flex-end">
          <Button
            bttype="primary"
            disabled={isSubmitting}
            onClick={handleSubmit((data) => console.log(data))}
            startIcon={<Save />}
          >
            Gem
          </Button>
          <Button
            bttype="tertiary"
            onClick={() => reset()}
            disabled={isSubmitting}
            sx={{marginLeft: 1}}
          >
            Annuller
          </Button>
        </Box>
      </FormProvider>
    </Box>
  );
};

export default Configuration;
