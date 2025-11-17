import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import {Box, Typography, TextField, InputAdornment, Alert, MenuItem} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import FormInput from '~/components/FormInput';
import TooltipWrapper from '~/components/TooltipWrapper';
import {
  useTimeseriesMeasureSampleSend,
  useTimeseriesMeasureSampleSendMutation,
} from '~/features/station/api/useTimeseriesMeasureSampleSend';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {useAppContext} from '~/state/contexts';
import ConfigAlert from './ConfigAlert';
import {z} from 'zod';
import Button from '~/components/Button';
import useBreakpoints from '~/hooks/useBreakpoints';
import {APIError} from '~/queryClient';
import {useMapOverview} from '~/hooks/query/useNotificationOverview';
import {useUser} from '~/features/auth/useUser';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import dayjs from 'dayjs';

const ConfigurationSchema = z.object({
  sampleInterval: z
    .number({required_error: 'Måleinterval er påkrævet'})
    .min(1, 'Måleinterval skal være mindst 1 minut'),
  sendInterval: z
    .number({required_error: 'Sendeinterval er påkrævet'})
    .min(1, 'Sendingsinterval skal være mindst 1 minut'),
});

type ConfigForm = {
  sampleInterval: number | undefined;
  sendInterval: number | undefined;
};

type ConfigSubmit = z.infer<typeof ConfigurationSchema>;

const NUM_OPTIONS = 100;

const convertMinutesToTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours} t ${mins} min`;
};

const getOptions = (sampleInterval: number | undefined) => {
  if (!sampleInterval) return [];
  return Array.from({length: NUM_OPTIONS}, (_, i) => i + 1).map((value) => {
    const interval = value * sampleInterval;

    const label = convertMinutesToTime(interval) + ` (${value} målinger)`;

    return (
      <MenuItem key={interval} value={interval}>
        {label}
      </MenuItem>
    );
  });
};

const UnitMeasurementConfig = () => {
  const {ts_id, loc_id} = useAppContext(['ts_id', 'loc_id']);
  const {data, isLoading, error} = useTimeseriesMeasureSampleSend(ts_id);
  const {data: timeseriesData} = useTimeseriesData(ts_id);
  const {data: currentLocation} = useMapOverview({
    select: (data) => data.find((loc) => loc.loc_id === loc_id),
  });
  const {mutate} = useTimeseriesMeasureSampleSendMutation(ts_id);
  const [options, setOptions] = useState<React.ReactNode[]>([]);
  const {isMobile} = useBreakpoints();
  const user = useUser();
  const values = data?.savedConfig ? data.savedConfig : undefined;

  const formMethods = useForm<ConfigForm, unknown, ConfigSubmit>({
    resolver: zodResolver(ConfigurationSchema),
    defaultValues: {
      sampleInterval: values?.sampleInterval || undefined,
      sendInterval: values?.sendInterval || undefined,
    },
    values: values,
  });

  const {
    handleSubmit,
    reset,
    formState: {isSubmitting, isDirty},
    getValues,
  } = formMethods;

  useEffect(() => {
    if (data) setOptions(getOptions(data?.savedConfig?.sampleInterval));
  }, [data]);

  if (timeseriesData?.calculated) {
    return (
      <Alert severity="info">
        Det er ikke muligt at ændre måle- og sendeforhold på beregnede tidsserier.
      </Alert>
    );
  }

  if (dayjs(timeseriesData?.slutdato).isBefore(dayjs())) {
    return (
      <Alert severity="info">
        Det er ikke muligt at ændre måle- og sendeforhold på tidsserier med hjemtaget udstyr.
      </Alert>
    );
  }

  if (error)
    return (
      <Typography>{String((error as APIError).response?.data.detail ?? 'Ukendt fejl')}</Typography>
    );

  if (isLoading) {
    return (
      <Box minWidth={isMobile ? '70vw' : 500} height={400}>
        <Typography>Loading</Typography>
      </Box>
    );
  }

  const configChange = convertDateWithTimeStamp(data?.estimatedConfigChange);
  const num_measurements = data?.currentConfig?.sendInterval
    ? Math.round(data?.currentConfig?.sendInterval / data?.currentConfig?.sampleInterval)
    : 0;
  return (
    <FormProvider {...formMethods}>
      <Box width="fit-content" alignItems="center">
        <TooltipWrapper
          color="info"
          description="De aktuelle sendeforhold er det vi har målt på de data vi har modtaget. Det betyder i nogle tilfælde at det er estimerede værdier."
        >
          <Typography variant="body1">Aktuelle sendeforhold</Typography>
        </TooltipWrapper>
      </Box>

      <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} mb={2}>
        <TextField
          label="Måleinterval"
          disabled
          fullWidth
          value={data?.currentConfig?.sampleInterval || ''}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">hvert</InputAdornment>,
              endAdornment: <InputAdornment position="start">minut</InputAdornment>,
            },
          }}
        />
        <TextField
          label="Sendingsinterval"
          disabled
          fullWidth
          value={
            data?.currentConfig?.sendInterval
              ? convertMinutesToTime(data?.currentConfig?.sendInterval) +
                ` (${num_measurements} målinger)`
              : ''
          }
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">hver</InputAdornment>,
            },
          }}
        />
      </Box>
      <Box width="fit-content" alignItems="center">
        <TooltipWrapper
          color="info"
          description="Ændringer i sendeforhold træder først i kraft når de er gemt og udstyret har opsamlet de
          nye sendeforhold. OBS. Alle tidsserie med samme terminal vil få samme sendeforhold."
        >
          <Typography variant="body1">Ønsket sendeforhold</Typography>
        </TooltipWrapper>
      </Box>
      {!data?.configPossible && (
        <Alert severity="warning">
          Det tilknyttede udstyr understøtter ikke ændring af sendeforhold via systemet.
        </Alert>
      )}
      <ConfigAlert
        status={data?.configState || null}
        timeseriesStatus={data?.currentPendingTimeseries || null}
        handleResend={handleSubmit((data) => mutate(data))}
      />
      <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} mb={-3}>
        <FormInput
          name="sampleInterval"
          label="Måleinterval"
          type="number"
          transform={(value: number) => {
            // transform the value to a positive integer
            if (value < 0) return Math.ceil(value);
            return Math.floor(value);
          }}
          fullWidth
          // onChangeCallback={() => {
          //   // reset sendInterval when sampleInterval changes
          //   formMethods.setValue('sendInterval', undefined);
          // }}
          onBlurCallback={() => {
            // reset sendInterval when sampleInterval changes
            const sampleInterval = getValues('sampleInterval');
            const sendInterval = getValues('sendInterval');
            setOptions(getOptions(sampleInterval));

            if (
              sendInterval &&
              sampleInterval &&
              Number.isInteger(sendInterval / sampleInterval) === false
            ) {
              formMethods.setValue('sendInterval', undefined);
            }
          }}
          disabled={
            !data?.configPossible ||
            (currentLocation?.is_customer_service && user?.superUser) ||
            (!currentLocation?.is_customer_service && !user?.superUser)
          }
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">hvert</InputAdornment>,
              endAdornment: <InputAdornment position="start">minut</InputAdornment>,
            },
          }}
        />

        <FormInput
          name="sendInterval"
          select
          fullWidth
          label="Sendeinterval"
          disabled={
            !data?.configPossible ||
            options.length === 0 ||
            (currentLocation?.is_customer_service && user?.superUser) ||
            (!currentLocation?.is_customer_service && !user?.superUser)
          }
          SelectProps={{
            MenuProps: {
              sx: {
                maxHeight: '300px',
              },
            },
          }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">hver</InputAdornment>,
            },
          }}
        >
          {options}
        </FormInput>
      </Box>

      <Typography variant="body2" color="textSecondary" sx={{mt: 1, mb: 2}}>
        Forventet tidspunkt for omkonfigurering {configChange ? configChange : 'ukendt'}
      </Typography>

      <Box display="flex" justifyContent="flex-end">
        <Button
          bttype="tertiary"
          onClick={() => reset()}
          disabled={isSubmitting || !data?.configPossible}
        >
          Annuller
        </Button>
        <Button
          bttype="primary"
          disabled={isSubmitting || !data?.configPossible || !isDirty}
          onClick={handleSubmit((data) => mutate(data))}
          startIcon={<Save />}
          sx={{marginLeft: 1}}
        >
          Gem
        </Button>
      </Box>
    </FormProvider>
  );
};

export default UnitMeasurementConfig;
