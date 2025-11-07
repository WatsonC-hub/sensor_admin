import {zodResolver} from '@hookform/resolvers/zod';
import {useQuery} from '@tanstack/react-query';
import React, {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import useSync from '~/features/station/components/stamdata/dmpSynkronisering/api/useSync';
import {useTimeseriesData, useLocationData} from '~/hooks/query/useMetadata';
import {useAppContext} from '~/state/contexts';
import {Box, Grid2, MenuItem} from '@mui/material';
import {createTypedForm} from '~/components/formComponents/Form';
import {useUser} from '~/features/auth/useUser';
import TooltipWrapper from '~/components/TooltipWrapper';
import useDmpAllowedMapList from '~/features/station/api/useDmpAllowedMapList';

const SyncSchema = z.object({
  sync_dmp: z.boolean().optional(),
  owner_cvr: z.number().optional(),
  owner_name: z.union([z.string(), z.literal('')]).optional(),
  jupiter: z.boolean().optional(),
});

type SyncFormValues = z.infer<typeof SyncSchema>;

const Form = createTypedForm<SyncFormValues>();

type SynchronizationProps = {
  setCanSync: (value: boolean) => void; // Placeholder until sync logic is implemented
};

const Synchronization = ({setCanSync}: SynchronizationProps) => {
  const {ts_id, loc_id} = useAppContext(['loc_id', 'ts_id']);
  const {data: metadata} = useTimeseriesData(ts_id);
  const {data: location_data} = useLocationData(loc_id);
  const user = useUser();

  const isJupiterType = [1, 11, 12, 16].includes(metadata?.tstype_id || 0);
  const isBorehole = location_data?.loctype_id === 9;

  const isDmpAllowed = useDmpAllowedMapList(ts_id);
  const canSyncJupiter = isBorehole && isJupiterType;

  const {
    get: {data: sync_data},
    post: postSync,
    del: deleteSync,
  } = useSync();

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

  const syncMethods = useForm<SyncFormValues>({
    defaultValues: {
      jupiter: sync_data?.jupiter ?? false,
      sync_dmp: sync_data?.owner_cvr ? true : false,
      owner_name: owner?.name ?? '',
      owner_cvr: owner?.cvr ? parseInt(owner.cvr) : undefined,
    },
    resolver: zodResolver(SyncSchema),
    mode: 'onTouched',
    values: sync_data,
  });

  const {
    reset: resetSync,
    watch,
    formState: {dirtyFields},
  } = syncMethods;

  const syncDmp = watch('sync_dmp');

  const submit = (data: SyncFormValues) => {
    const cvr = owners?.find((owner) => owner.name === data.owner_name)?.cvr;

    const syncPayload = {
      path: `${ts_id}`,
      data: {
        ...(data.sync_dmp && dirtyFields.sync_dmp !== undefined
          ? {
              sync_dmp: data.sync_dmp,
              owner_cvr: cvr ? parseInt(cvr) : undefined,
              owner_name: data.owner_name,
            }
          : {}),
        jupiter: data.jupiter,
      },
    };

    postSync.mutate(syncPayload);

    if (data.sync_dmp == false && dirtyFields.sync_dmp !== undefined) {
      deleteSync.mutate({path: ts_id.toString()});
    }
  };

  useEffect(() => {
    if (metadata && location_data && user) {
      setCanSync(!!(isDmpAllowed || canSyncJupiter));
    }
  }, [metadata, location_data, user]);

  return (
    <Box display={'flex'} flexDirection="column">
      {(isDmpAllowed || canSyncJupiter) && (
        <Form formMethods={syncMethods} gridSizes={12}>
          {canSyncJupiter && (
            <TooltipWrapper description="Aktiverer synkronisering af denne tidsserie til Jupiter">
              <Form.Checkbox name="jupiter" label="Jupiter" />
            </TooltipWrapper>
          )}
          {isDmpAllowed && (
            <>
              <Form.Checkbox name="sync_dmp" label="DMP" disabled={sync_data?.sync_dmp} />
              <TooltipWrapper description="Aktiverer synkronisering af denne tidsserie til DMP">
                <Form.Input
                  select
                  name="owner_name"
                  label="Data ejer"
                  disabled={!syncDmp || sync_data?.sync_dmp}
                >
                  <MenuItem value="" disabled>
                    Vælg data ejer
                  </MenuItem>
                  {owners?.map((owner) => (
                    <MenuItem key={owner.cvr} value={owner.name}>
                      {owner.name} ({owner.cvr})
                    </MenuItem>
                  ))}
                </Form.Input>
              </TooltipWrapper>
            </>
          )}

          <Grid2 size={12} sx={{alignSelf: 'end'}} display="flex" gap={1} justifyContent="flex-end">
            <Form.Cancel cancel={() => resetSync()} />
            <Form.Submit submit={submit} />
          </Grid2>
        </Form>
      )}
    </Box>
  );
};

export default Synchronization;
