import {zodResolver} from '@hookform/resolvers/zod';
import SaveIcon from '@mui/icons-material/Save';
import {Box} from '@mui/material';
import {useMutation} from '@tanstack/react-query';
import React, {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {toast} from 'react-toastify';
import {z} from 'zod';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import FormFieldset from '~/components/formComponents/FormFieldset';
import usePermissions from '~/features/permissions/api/usePermissions';
import useTimeseriesForm from '~/features/station/api/useTimeseriesForm';
import SyncForm from '~/features/station/components/stamdata/dmpSynkronisering/SyncForm';
import StamdataTimeseries from '~/features/station/components/stamdata/StamdataTimeseries';
import {boreholeEditTimeseriesSchema, defaultEditTimeseriesSchema} from '~/features/station/schema';
import {useLocationData, useTimeseriesData} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import {queryClient} from '~/queryClient';
import {useAppContext} from '~/state/contexts';

const SyncSchema = z.object({
  dmp: z.boolean().nullable(),
  jupiter: z.boolean().nullable(),
});

export type SyncFormValues = z.infer<typeof SyncSchema>;

const EditTimeseries = () => {
  const {ts_id, loc_id} = useAppContext(['ts_id'], ['loc_id']);
  const {data: metadata} = useTimeseriesData(ts_id);
  const {data: location_data} = useLocationData(loc_id);
  const {location_permissions} = usePermissions(loc_id);
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;

  const isSyncAvailable =
    metadata?.tstype_id === 1 ||
    metadata?.tstype_id === 2 ||
    metadata?.tstype_id === 8 ||
    metadata?.tstype_id === 11;

  const metadataEditTimeseriesMutation = useMutation({
    mutationFn: async (data: any) => {
      const {data: out} = await apiClient.put(
        `/sensor_field/stamdata/update_timeseries/${ts_id}`,
        data
      );
      return out;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['metadata', ts_id],
      });
      queryClient.invalidateQueries({queryKey: ['location_data', loc_id]});
      toast.success('Tidsserie er opdateret');
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
    sensor_depth_m: metadata?.sensor_depth_m,
    intakeno: metadata?.intakeno,
  });

  const SyncMethods = useForm<SyncFormValues>({
    resolver: zodResolver(SyncSchema),
    defaultValues: {
      dmp: metadata?.syncDmp,
      jupiter: metadata?.syncJupiter,
    },
    mode: 'onChange',
  });

  const {
    getValues: getSyncValues,
    reset: resetSync,
    formState: {isDirty: syncIsDirty, isValid: syncIsValid},
  } = SyncMethods;

  const [formMethods, TimeseriesForm] = useTimeseriesForm({
    defaultValues: defaultValues,
    mode: 'Edit',
    context: {
      loctype_id: metadata?.loctype_id,
    },
  });

  const {
    formState: {isDirty, isValid},
    reset,
    getValues: getTimeseriesValues,
    trigger,
  } = formMethods;

  useEffect(() => {
    if (metadata != undefined) {
      reset(defaultValues);
    }
  }, [metadata]);

  useEffect(() => {
    if (error) {
      trigger();
    }
  }, []);

  const Submit = () => {
    const data = getTimeseriesValues();
    const dmpData = getSyncValues();

    const payload = {
      ...data,
      ...dmpData,
    };
    metadataEditTimeseriesMutation.mutate(payload);
  };

  return (
    <Box maxWidth={1080} display={'flex'} flexDirection="column" gap={2}>
      <FormProvider {...formMethods}>
        <FormFieldset label="Datasynkronisering">
          <StamdataTimeseries boreholeno={metadata?.boreholeno ?? undefined}>
            <TimeseriesForm size={size} loc_name={metadata?.loc_name} />
          </StamdataTimeseries>
        </FormFieldset>
        {isSyncAvailable && (
          <SyncForm
            formMethods={SyncMethods}
            loctype_id={location_data?.loctype_id}
            tstype_id={metadata?.tstype_id}
          />
        )}
        <footer>
          <Box display="flex" gap={1} justifyContent="flex-end" justifySelf="end">
            <Button
              bttype="tertiary"
              onClick={() => {
                reset(defaultValues);
                resetSync();
              }}
              disabled={location_permissions !== 'edit'}
            >
              Annuller
            </Button>

            <Button
              bttype="primary"
              disabled={
                ((!isDirty || !isValid) && (!syncIsDirty || !syncIsValid)) ||
                location_permissions !== 'edit'
              }
              onClick={Submit}
              startIcon={<SaveIcon />}
              sx={{marginRight: 1}}
            >
              Gem
            </Button>
          </Box>
        </footer>
      </FormProvider>
    </Box>
  );
};

export default EditTimeseries;
