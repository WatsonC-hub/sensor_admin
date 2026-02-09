import React from 'react';
import useSyncForm, {SyncFormValues} from '../api/useSyncForm';
import {createTypedForm} from '~/components/formComponents/Form';
import TooltipWrapper from '~/components/TooltipWrapper';
import {Grid2, Box} from '@mui/material';
import usePermissions from '~/features/permissions/api/usePermissions';

const Form = createTypedForm<SyncFormValues>();

type JupiterDmpSyncProps = {
  mode: 'add' | 'edit' | 'mass_edit';
  loctype_id?: number;
  tstype_id?: number;
  values: SyncFormValues | undefined;
  submit: (data: SyncFormValues) => void;
  intakeno?: number | null;
};

const JupiterDmpSync = ({
  loctype_id,
  tstype_id,
  mode,
  values,
  submit,
  intakeno,
}: JupiterDmpSyncProps) => {
  const {syncFormMethods, isDmpAllowed, canSyncJupiter, owners} = useSyncForm<SyncFormValues>({
    mode: mode,
    context: {
      loctype_id,
      tstype_id,
    },
    values: values,
  });

  const {watch, trigger, setValue, reset} = syncFormMethods;
  const {location_permissions} = usePermissions();
  const sync_dmp = watch('sync_dmp');

  return (
    <>
      {(canSyncJupiter || isDmpAllowed) && (
        <Form formMethods={syncFormMethods} gridSizes={12}>
          {canSyncJupiter && (
            <TooltipWrapper
              description={
                intakeno == null
                  ? 'Indtagsnummer mangler før du kan synkronisere til Jupiter. Indtast det under rediger tidsserie.'
                  : 'Aktiverer synkronisering af denne tidsserie til Jupiter'
              }
            >
              <Form.Checkbox
                disabled={location_permissions !== 'edit' || intakeno == null}
                name="jupiter"
                label="Jupiter"
              />
            </TooltipWrapper>
          )}
          {isDmpAllowed && (
            <Box>
              <Form.Checkbox
                name={'sync_dmp'}
                label="DMP"
                disabled={sync_dmp && mode === 'edit'}
                onChangeCallback={(value) => {
                  if (!value) {
                    trigger('owner_cvr');
                    setValue('owner_cvr', undefined);
                    setValue('owner_name', undefined);
                  }
                }}
              />
              <TooltipWrapper description="Aktiverer synkronisering af denne tidsserie til DMP">
                <Form.Input
                  select
                  name="owner_cvr"
                  label="Data ejer"
                  disabled={!sync_dmp && mode === 'edit'}
                  placeholder="Vælg data ejer"
                  options={owners?.map((owner) => ({
                    [owner.cvr]: owner.name + ` (${owner.cvr})`,
                  }))}
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
            </Box>
          )}

          <Grid2 size={12} sx={{alignSelf: 'end'}} display="flex" gap={1} justifyContent="flex-end">
            <Form.Cancel cancel={() => reset()} />
            <Form.Submit submit={submit} />
          </Grid2>
        </Form>
      )}
    </>
  );
};

export default JupiterDmpSync;
