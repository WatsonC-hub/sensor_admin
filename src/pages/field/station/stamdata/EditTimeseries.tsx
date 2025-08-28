import {zodResolver} from '@hookform/resolvers/zod';
import SaveIcon from '@mui/icons-material/Save';
import {Box} from '@mui/material';
import {useMutation, useQuery} from '@tanstack/react-query';
import React, {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {toast} from 'react-toastify';
import {z} from 'zod';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import FormFieldset from '~/components/formComponents/FormFieldset';
import usePermissions from '~/features/permissions/api/usePermissions';
import useTimeseriesForm from '~/features/station/api/useTimeseriesForm';
import useSync from '~/features/station/components/stamdata/dmpSynkronisering/api/useSync';
import SyncForm from '~/features/station/components/stamdata/dmpSynkronisering/components/SyncForm';
import StamdataTimeseries from '~/features/station/components/stamdata/StamdataTimeseries';
import {boreholeEditTimeseriesSchema, defaultEditTimeseriesSchema} from '~/features/station/schema';
import {useLocationData, useTimeseriesData} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useAppContext} from '~/state/contexts';

const SyncSchema = z.object({
  sync_dmp: z.boolean().optional(),
  owner_cvr: z.number().optional(),
  owner_name: z.union([z.string(), z.literal('')]).optional(),
  jupiter: z.boolean().optional(),
});

export type SyncFormValues = z.infer<typeof SyncSchema>;

const EditTimeseries = () => {
  const {ts_id, loc_id} = useAppContext(['loc_id', 'ts_id']);
  const {data: metadata} = useTimeseriesData(ts_id);
  const {data: location_data} = useLocationData(loc_id);

  const {location_permissions} = usePermissions(loc_id);
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;

  const {
    get: {data: sync_data},
    post: postSync,
    del: deleteSync,
  } = useSync();

  const metadataEditTimeseriesMutation = useMutation({
    mutationFn: async (data: any) => {
      const {data: out} = await apiClient.put(
        `/sensor_field/stamdata/update_timeseries/${ts_id}`,
        data
      );
      return out;
    },
    onSuccess: () => {
      toast.success('Tidsserie er opdateret');
    },
    meta: {
      invalidates: [['metadata']],
    },
  });

  const result = useQuery({
    queryKey: ['owners'],
    queryFn: async () => {
      const data = await fetch(`https://kemidata.miljoeportal.dk/api/metadata?language=da`).then(
        async (res) => {
          const metadata = await res.json();
          return metadata.stationOwners;
        }
      );
      return data;
    },
  });

  const owners: Array<{cvr: string; name: string}> = result.data;
  const owner = owners?.find((owner) => owner.cvr === sync_data?.owner_cvr?.toString());
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

  const syncMethods = useForm<SyncFormValues>({
    resolver: zodResolver(SyncSchema),
    mode: 'onTouched',
    values: {
      jupiter: sync_data?.jupiter ?? undefined,
      sync_dmp: sync_data?.owner_cvr ? true : undefined,
      owner_name: owner?.name ?? '',
      owner_cvr: owner?.cvr ? parseInt(owner.cvr) : undefined,
    },
  });

  const {
    getValues: getSyncValues,
    reset: resetSync,
    formState: {isDirty: syncIsDirty, isValid: syncIsValid},
  } = syncMethods;

  const [formMethods, TimeseriesForm] = useTimeseriesForm({
    formProps: {
      // defaultValues: defaultValues,
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
    getValues: getTimeseriesValues,
    trigger,
  } = formMethods;

  useEffect(() => {
    if (error) {
      trigger();
    }
  }, []);

  const Submit = () => {
    if (isValid && isDirty) {
      const data = getTimeseriesValues();
      const payload = {
        ...data,
      };
      metadataEditTimeseriesMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Tidsserie er opdateret');
        },
      });
    }

    if (syncIsValid && syncIsDirty) {
      const syncData = getSyncValues();
      const cvr = owners?.find((owner) => owner.name === syncData.owner_name)?.cvr;

      const syncPayload = {
        path: `${ts_id}`,
        data: {
          ...(syncData.sync_dmp
            ? {
                ...syncData,
                owner_cvr: cvr ? parseInt(cvr) : undefined,
              }
            : {}),
          jupiter: syncData.jupiter,
        },
      };

      postSync.mutate(syncPayload);

      if (syncData.sync_dmp == false) {
        deleteSync.mutate({path: ts_id.toString()});
      }
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
        <FormFieldset label="Stamdata">
          <StamdataTimeseries boreholeno={metadata?.boreholeno ?? undefined}>
            <TimeseriesForm size={size} loc_name={metadata?.loc_name} />
          </StamdataTimeseries>
        </FormFieldset>

        <SyncForm
          key={`sync-form-${ts_id}`}
          formMethods={syncMethods}
          loctype_id={location_data?.loctype_id}
          tstype_id={metadata?.tstype_id}
          owners={owners}
        />

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
      </FormProvider>
    </Box>
  );
};

export default EditTimeseries;
