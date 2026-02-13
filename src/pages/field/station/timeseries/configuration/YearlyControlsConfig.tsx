import {Save} from '@mui/icons-material';
import {Grid2, Typography} from '@mui/material';
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
import UpdateProgressButton from '~/features/station/components/UpdateProgressButton';
import usePermissions from '~/features/permissions/api/usePermissions';

const YearlyControlsConfig = () => {
  const {loc_id, ts_id} = useAppContext(['loc_id', 'ts_id']);
  const {data: values} = useTimeseriesServiceInterval(ts_id);

  const {mutate} = useTimeseriesServiceIntervalMutation(ts_id);
  const {superUser} = useUser();
  const {location_permissions} = usePermissions(loc_id);

  const disabled =
    (values?.isCustomerService && superUser) ||
    (!values?.isCustomerService && !superUser) ||
    location_permissions !== 'edit';

  const formMethods = useControlSettingsForm<ControlSettingsFormValues>({
    defaultValues: {
      controls_per_year: null,
      lead_time: null,
      dummy: null,
      selectValue: 1,
    },
    values: values && {
      controls_per_year: values.controlsPerYear,
      lead_time: values.leadTime ?? null,
      dummy: values.controlsPerYear !== null ? Number(values.controlsPerYear.toFixed(3)) : null,
      selectValue: 1,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: {isSubmitting, dirtyFields, isDirty},
  } = formMethods;

  const onSubmit = (data: ControlSettingsFormValues) => {
    console.log(data);
    mutate(
      {
        controls_per_year: data.controls_per_year,
        lead_time: data.lead_time,
      },
      {
        onSuccess: () => {
          reset();
        },
      }
    );
  };

  return (
    <FormProvider {...formMethods}>
      <EditControlSettings disabled={disabled} />

      {!disabled && (
        <Grid2 size={12} display="flex" justifyContent={'flex-end'} gap={1}>
          <UpdateProgressButton
            loc_id={loc_id}
            ts_id={ts_id}
            progressKey="kontrolhyppighed"
            disabled={disabled || isDirty}
          />
          <Button
            bttype="tertiary"
            onClick={() => {
              reset();
            }}
            disabled={isSubmitting || !isDirty}
          >
            <Typography variant="body2">Annuller</Typography>
          </Button>
          <Button
            bttype="primary"
            disabled={
              isSubmitting ||
              Object.keys(dirtyFields).filter((key) => key !== 'selectValue').length === 0 ||
              !isDirty
            }
            onClick={handleSubmit(onSubmit, (error) => console.log(error))}
            startIcon={<Save />}
          >
            <Typography variant="body2">Gem</Typography>
          </Button>
        </Grid2>
      )}
    </FormProvider>
  );
};

export default YearlyControlsConfig;
