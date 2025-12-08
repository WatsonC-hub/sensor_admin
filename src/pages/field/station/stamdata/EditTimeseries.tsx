import SaveIcon from '@mui/icons-material/Save';
import {Box} from '@mui/material';
import {useMutation} from '@tanstack/react-query';
import React, {useEffect} from 'react';
import {FormProvider} from 'react-hook-form';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import usePermissions from '~/features/permissions/api/usePermissions';
import useTimeseriesForm from '~/features/station/api/useTimeseriesForm';
import StamdataTimeseries from '~/features/station/components/stamdata/StamdataTimeseries';
import {
  BoreholeEditTimeseries,
  boreholeEditTimeseriesSchema,
  DefaultEditTimeseries,
  defaultEditTimeseriesSchema,
} from '~/features/station/schema';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useAppContext} from '~/state/contexts';

const EditTimeseries = () => {
  const {ts_id, loc_id} = useAppContext(['loc_id', 'ts_id']);
  const {data: metadata} = useTimeseriesData(ts_id);

  const {location_permissions} = usePermissions(loc_id);
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;

  const metadataEditTimeseriesMutation = useMutation({
    mutationFn: async (data: any) => {
      const {data: out} = await apiClient.put(
        `/sensor_field/stamdata/update_timeseries/${ts_id}`,
        data
      );
      return out;
    },
    meta: {
      invalidates: [['metadata']],
    },
  });

  let schema;

  if (metadata?.loctype_id === 9) {
    schema = boreholeEditTimeseriesSchema;
  } else {
    schema = defaultEditTimeseriesSchema;
  }

  const {data: defaultValues, error} = schema.safeParse({
    prefix: metadata?.prefix,
    ...(metadata?.calculated ? {} : {sensor_depth_m: metadata?.sensor_depth_m}),
    intakeno: metadata?.intakeno,
    requires_auth: metadata?.requires_auth ?? false,
    hide_public: metadata?.hide_public ?? false,
    borehole_calypso_id: metadata?.borehole_calypso_id ?? undefined,
  });

  const [formMethods, TimeseriesForm] = useTimeseriesForm({
    formProps: {
      context: {
        loctype_id: metadata?.loctype_id,
      },
      values: defaultValues,
    },
    mode: 'Edit',
  });

  const {
    formState: {isDirty, isValid},
    reset,
    trigger,
    handleSubmit,
  } = formMethods;

  useEffect(() => {
    if (error) {
      trigger();
    }
  }, []);

  const Submit = (data: BoreholeEditTimeseries | DefaultEditTimeseries) => {
    if (isValid && isDirty) {
      const payload = {
        ...data,
      };
      metadataEditTimeseriesMutation.mutate(payload);
    }
  };

  return (
    <Box
      maxWidth={1080}
      display={'flex'}
      flexDirection="column"
      gap={2}
      sx={{
        borderRadius: 4,
        boxShadow: 3,
        padding: 2,
      }}
    >
      <FormProvider {...formMethods}>
        <StamdataTimeseries boreholeno={metadata?.boreholeno ?? undefined}>
          <TimeseriesForm size={size} loc_name={metadata?.loc_name} />
        </StamdataTimeseries>

        <Box display="flex" gap={1} justifyContent="flex-end" justifySelf="end">
          <Button
            bttype="tertiary"
            onClick={() => {
              reset(defaultValues);
            }}
            disabled={location_permissions !== 'edit'}
          >
            Annuller
          </Button>

          <Button
            bttype="primary"
            disabled={!isDirty || !isValid || location_permissions !== 'edit'}
            onClick={handleSubmit(Submit)}
            startIcon={<SaveIcon />}
            sx={{marginRight: 1}}
          >
            Gem
          </Button>
        </Box>
      </FormProvider>
    </Box>
  );
};

export default EditTimeseries;
