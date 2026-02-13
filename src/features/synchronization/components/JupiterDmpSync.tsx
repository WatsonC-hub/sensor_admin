import React from 'react';
import useSyncForm, {SyncFormValues} from '../api/useSyncForm';
import {createTypedForm} from '~/components/formComponents/Form';
import TooltipWrapper from '~/components/TooltipWrapper';
import {Grid2, Box} from '@mui/material';
import usePermissions from '~/features/permissions/api/usePermissions';
import UpdateProgressButton from '~/features/station/components/UpdateProgressButton';

const Form = createTypedForm<SyncFormValues>();

type JupiterDmpSyncProps = {
  loctype_id?: number;
  tstype_id?: number;
  values: SyncFormValues | undefined;
  submit: (data: SyncFormValues) => void;
  intakeno?: number | null;
  ts_id: number;
};

const JupiterDmpSync = ({
  loctype_id,
  tstype_id,
  values,
  submit,
  intakeno,
  ts_id,
}: JupiterDmpSyncProps) => {
  const {syncFormMethods, isDmpAllowed, canSyncJupiter, owners} = useSyncForm<SyncFormValues>({
    context: {
      loctype_id,
      tstype_id,
    },
    values: values,
  });

  const {
    setValue,
    reset,
    formState: {isDirty},
  } = syncFormMethods;
  const {location_permissions} = usePermissions();

  const disabled = location_permissions !== 'edit';

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
                disabled={disabled || intakeno == null}
                name="jupiter"
                label="Jupiter"
              />
            </TooltipWrapper>
          )}
          {isDmpAllowed && (
            <Box>
              <TooltipWrapper description="Aktiverer synkronisering af denne tidsserie til DMP">
                <Form.Input
                  select
                  name="owner_cvr"
                  label="Data ejer"
                  disabled={disabled}
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
                      setValue('owner_cvr', parseInt(owner.cvr), {shouldDirty: true});
                      setValue('owner_name', owner.name, {shouldDirty: true});
                    }
                  }}
                />
              </TooltipWrapper>
            </Box>
          )}

          <Grid2 size={12} sx={{alignSelf: 'end'}} display="flex" gap={1} justifyContent="flex-end">
            <UpdateProgressButton
              progressKey="sync"
              loc_id={-1}
              ts_id={ts_id}
              disabled={disabled || isDirty}
            />
            <Form.Cancel cancel={() => reset()} disabled={disabled || !isDirty} />
            <Form.Submit submit={submit} />
          </Grid2>
        </Form>
      )}
    </>
  );
};

export default JupiterDmpSync;
