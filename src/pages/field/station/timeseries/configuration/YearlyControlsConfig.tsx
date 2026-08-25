import {Save} from '@mui/icons-material';
import {Grid, Typography} from '@mui/material';
import React from 'react';
import {FormProvider} from 'react-hook-form';

import Button from '~/components/Button';
import {useUser} from '~/features/auth/useUser';
import useControlSettingsForm from '~/features/configuration/api/useControlSettingsForm';
import EditControlSettings from '~/features/configuration/components/EditControlSettings';
import usePermissions from '~/features/permissions/api/usePermissions';
import {
  useTimeseriesServiceInterval,
  useTimeseriesServiceIntervalMutation,
} from '~/features/station/api/useTimeseriesServiceInterval';
import UpdateProgressButton from '~/features/station/components/UpdateProgressButton';
import {useAppContext} from '~/state/contexts';

import type {ControlSettingsFormValues} from '~/features/configuration/api/useControlSettingsForm';

const YearlyControlsConfig = () => {
  const {loc_id, ts_id} = useAppContext(['loc_id', 'ts_id']);
  const {data: values} = useTimeseriesServiceInterval(ts_id);

  const {mutateAsync} = useTimeseriesServiceIntervalMutation(ts_id);
  const {superUser} = useUser();
  const {location_permissions} = usePermissions(loc_id);

  const disabled =
    (values?.isCustomerService && superUser) ||
    (!values?.isCustomerService && !superUser) ||
    location_permissions !== 'edit';

  const formMethods = useControlSettingsForm({
    defaultValues: {
      controls_per_year: undefined,
      lead_time: null,
      dummy: null,
      selectValue: 1,
    },
    values: {
      controls_per_year: values.controlsPerYear,
      lead_time: values.leadTime,
      dummy: values.controlsPerYear !== null ? Number(values.controlsPerYear.toFixed(3)) : null,
      selectValue: 1,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: {isSubmitting, dirtyFields, isDirty},
  } = formMethods;

  const onSubmit = async (data: ControlSettingsFormValues) => {
    await mutateAsync({
      controls_per_year: data.controls_per_year,
      lead_time: data.lead_time,
    });

    reset();
  };

  return (
    <FormProvider {...formMethods}>
      <EditControlSettings disabled={disabled} />
      {!disabled && (
        <Grid
          size={12}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
          }}
        >
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
              Object.keys(dirtyFields).filter((key) => key !== 'selectValue').length === 0 ||
              !isDirty
            }
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit, (error) => console.log(error))}
            startIcon={isSubmitting ? undefined : <Save />}
          >
            <Typography variant="body2">Gem</Typography>
          </Button>
        </Grid>
      )}
    </FormProvider>
  );
};

export default YearlyControlsConfig;
