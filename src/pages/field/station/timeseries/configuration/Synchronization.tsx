import {zodResolver} from '@hookform/resolvers/zod';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import useSync from '~/features/station/components/stamdata/dmpSynkronisering/api/useSync';
import {useAppContext} from '~/state/contexts';
import {Box, Grid2} from '@mui/material';
import {createTypedForm} from '~/components/formComponents/Form';
import TooltipWrapper from '~/components/TooltipWrapper';
import UpdateProgressButton from '~/features/station/components/UpdateProgressButton';
import usePermissions from '~/features/permissions/api/usePermissions';
import {useTimeseriesData} from '~/hooks/query/useMetadata';

const SyncSchema = z
  .object({
    sync_dmp: z.boolean().optional(),
    owner_cvr: z.number().optional(),
    owner_name: z.union([z.string(), z.literal('')]).optional(),
    jupiter: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.sync_dmp) {
        return data.owner_name !== undefined && data.owner_name !== null && data.owner_name !== '';
      }
      return true;
    },
    {
      message: 'Data ejer skal være udfyldt, når DMP synkronisering er aktiveret',
      path: ['owner_name'],
    }
  );

type SyncFormValues = z.infer<typeof SyncSchema>;

const Form = createTypedForm<SyncFormValues>();

type SynchronizationProps = {
  canSyncJupiter?: boolean;
  isDmpAllowed?: boolean;
  disabled?: boolean;
};

const Synchronization = ({canSyncJupiter, isDmpAllowed, disabled}: SynchronizationProps) => {
  const {ts_id, loc_id} = useAppContext(['ts_id', 'loc_id']);
  const {location_permissions} = usePermissions(loc_id);

  const {data: metadata} = useTimeseriesData(ts_id);
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
      jupiter: undefined,
      sync_dmp: undefined,
      owner_name: undefined,
      owner_cvr: undefined,
    },
    resolver: zodResolver(SyncSchema),
    mode: 'onTouched',
    values: sync_data && {
      jupiter: sync_data.jupiter ?? undefined,
      sync_dmp: sync_data.owner_cvr ? true : false,
      owner_name: owner?.name ?? undefined,
      owner_cvr: owner?.cvr ? parseInt(owner.cvr) : undefined,
    },
  });

  const {
    reset: resetSync,
    watch,
    setValue,
    trigger,
    formState: {dirtyFields, isDirty},
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

  return (
    <Box display={'flex'} flexDirection="column">
      {(isDmpAllowed || canSyncJupiter) && (
        <Form formMethods={syncMethods} gridSizes={12}>
          {canSyncJupiter && (
            <TooltipWrapper
              description={
                metadata?.intakeno == null
                  ? 'Indtagsnummer mangler før du kan synkronisere til Jupiter. Indtast det under rediger tidsserie.'
                  : 'Aktiverer synkronisering af denne tidsserie til Jupiter'
              }
            >
              <Form.Checkbox
                disabled={location_permissions !== 'edit' || metadata?.intakeno == null || disabled}
                name="jupiter"
                label="Jupiter"
              />
            </TooltipWrapper>
          )}
          {isDmpAllowed && (
            <>
              <Form.Checkbox
                name="sync_dmp"
                label="DMP"
                disabled={sync_data?.sync_dmp || location_permissions !== 'edit'}
                onChangeCallback={(value) => {
                  if (!value) trigger('owner_cvr');
                }}
              />
              <TooltipWrapper description="Aktiverer synkronisering af denne tidsserie til DMP">
                <Form.Input
                  select
                  name="owner_cvr"
                  label="Data ejer"
                  disabled={!syncDmp || sync_data?.sync_dmp || location_permissions !== 'edit'}
                  placeholder="Vælg data ejer"
                  options={owners?.map((owner) => ({[owner.cvr]: owner.name + ` (${owner.cvr})`}))}
                  onChangeCallback={(value) => {
                    const owner_cvr = (
                      value as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
                    ).target.value;
                    const owner = owners?.find((owner) => owner.cvr === owner_cvr);
                    if (owner) {
                      setValue('owner_cvr', parseInt(owner.cvr));
                      setValue('owner_name', owner.name);
                    }
                  }}
                />
              </TooltipWrapper>
            </>
          )}

          {!disabled && (
            <Grid2 size={12} display="flex" justifyContent={'flex-end'} gap={1}>
              <UpdateProgressButton
                loc_id={loc_id}
                disabled={isDirty || location_permissions !== 'edit'}
                ts_id={ts_id}
                progressKey="sync"
              />
              <Form.Cancel
                disabled={location_permissions !== 'edit' || !isDirty}
                cancel={() => resetSync()}
              />
              <Form.Submit disabled={location_permissions !== 'edit'} submit={submit} />
            </Grid2>
          )}
        </Form>
      )}
    </Box>
  );
};

export default Synchronization;
