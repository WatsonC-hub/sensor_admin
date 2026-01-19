import {Save} from '@mui/icons-material';
import {Box} from '@mui/material';
import React from 'react';
import {FormProvider} from 'react-hook-form';
import {useAppContext} from '~/state/contexts';
import {
  useTimeseriesServiceInterval,
  useTimeseriesServiceIntervalMutation,
} from '~/features/station/api/useTimeseriesServiceInterval';
import Button from '~/components/Button';
import EditControlSettings from '~/features/configuration/components/EditControlSettings';
import useControlSettingsForm, {
  ControlSettingsFormValues,
} from '~/features/configuration/api/useControlSettingsForm';
import {useUser} from '~/features/auth/useUser';

const YearlyControlsConfig = () => {
  const {ts_id} = useAppContext(['ts_id']);
  const {data: values} = useTimeseriesServiceInterval(ts_id);
  const {mutate} = useTimeseriesServiceIntervalMutation(ts_id);
  const {superUser} = useUser();

  const formMethods = useControlSettingsForm<ControlSettingsFormValues>({
    mode: 'edit',
    defaultValues: {
      controls_per_year: null,
      lead_time: null,
      dummy: null,
      selectValue: 1,
    },
    values: values && {
      controls_per_year: values.controlsPerYear,
      lead_time: values.leadTime ?? null,
      dummy: values.controlsPerYear ? Number(values.controlsPerYear.toFixed(3)) : null,
      selectValue: 1,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: {isSubmitting, dirtyFields},
  } = formMethods;

  const disabled =
    (values?.isCustomerService && superUser) || (!values?.isCustomerService && !superUser);

  const onSubmit = (data: ControlSettingsFormValues) => {
    mutate(
      {
        controls_per_year: data.dummy !== null ? data.controls_per_year : null,
        lead_time: data.lead_time,
      },
      {
        onSuccess: () => reset(),
      }
    );
  };

  return (
    <FormProvider {...formMethods}>
      <EditControlSettings disabled={disabled} />

      <Box display="flex" justifyContent="flex-end">
        <Button
          bttype="tertiary"
          onClick={() => {
            reset();
          }}
          disabled={isSubmitting}
        >
          Annuller
        </Button>
        <Button
          bttype="primary"
          disabled={
            isSubmitting ||
            Object.keys(dirtyFields).filter((key) => key !== 'selectValue').length === 0
          }
          onClick={handleSubmit(onSubmit, (error) => console.log(error))}
          startIcon={<Save />}
          sx={{marginLeft: 1}}
        >
          Gem
        </Button>
      </Box>
    </FormProvider>
  );
};

export default YearlyControlsConfig;
