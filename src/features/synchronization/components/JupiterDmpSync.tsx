import React from 'react';
import useSyncForm, {SyncFormValues} from '../api/useSyncForm';
import {createTypedForm} from '~/components/formComponents/Form';
import TooltipWrapper from '~/components/TooltipWrapper';
import {Box, Grid2, Typography} from '@mui/material';

const Form = createTypedForm<SyncFormValues>();

type JupiterDmpSyncProps = {
  mode: 'add' | 'edit' | 'mass_edit';
  loctype_id?: number;
  tstype_id?: number;
  values?: SyncFormValues;
  submit?: (data: SyncFormValues) => void;
  onValidate?: (key: 'sync', data: SyncFormValues) => void;
};

const JupiterDmpSync = ({
  loctype_id,
  tstype_id,
  mode,
  values,
  submit,
  onValidate,
}: JupiterDmpSyncProps) => {
  const {syncFormMethods, isDmpAllowed, canSyncJupiter, owners} = useSyncForm<SyncFormValues>({
    mode: mode,
    defaultValues: {
      jupiter: false,
      sync_dmp: false,
      owner_name: undefined,
      owner_cvr: undefined,
    },
    context: {
      loctype_id,
      tstype_id,
    },
    values: values,
  });

  const {watch, trigger, setValue, reset, getValues} = syncFormMethods;
  const sync_dmp = watch('sync_dmp');

  return (
    <>
      {(canSyncJupiter || isDmpAllowed) && (
        <Box>
          <Typography variant="subtitle1" marginBottom={1}>
            Synkronisering
          </Typography>

          <Form formMethods={syncFormMethods} gridSizes={12}>
            {canSyncJupiter && (
              <TooltipWrapper description="Aktiverer synkronisering af denne tidsserie til Jupiter">
                <Form.Checkbox
                  name="jupiter"
                  label="Jupiter"
                  onChangeCallback={(value) => {
                    if (onValidate)
                      onValidate('sync', {
                        ...getValues(),
                        jupiter: value,
                      });
                  }}
                />
              </TooltipWrapper>
            )}
            {isDmpAllowed && (
              <>
                <Form.Checkbox
                  name="sync_dmp"
                  label="DMP"
                  disabled={sync_dmp}
                  onChangeCallback={(value) => {
                    if (!value) trigger('owner_cvr');
                    if (onValidate)
                      onValidate('sync', {
                        ...getValues(),
                        sync_dmp: value,
                      });
                  }}
                />
                <TooltipWrapper description="Aktiverer synkronisering af denne tidsserie til DMP">
                  <Form.Input
                    select
                    name="owner_cvr"
                    label="Data ejer"
                    disabled={!sync_dmp || values?.sync_dmp}
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
                      if (onValidate)
                        onValidate('sync', {
                          ...getValues(),
                          owner_cvr: parseInt(owner_cvr),
                          owner_name: owner ? owner.name : undefined,
                        });
                    }}
                  />
                </TooltipWrapper>
              </>
            )}

            {mode !== 'add' && submit && (
              <Grid2
                size={12}
                sx={{alignSelf: 'end'}}
                display="flex"
                gap={1}
                justifyContent="flex-end"
              >
                <Form.Cancel cancel={() => reset()} />
                <Form.Submit submit={submit} />
              </Grid2>
            )}
          </Form>
        </Box>
      )}
    </>
  );
};

export default JupiterDmpSync;
