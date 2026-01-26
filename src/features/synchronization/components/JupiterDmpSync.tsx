import React, {useEffect} from 'react';
import useSyncForm, {SyncFormValues} from '../api/useSyncForm';
import {createTypedForm} from '~/components/formComponents/Form';
import TooltipWrapper from '~/components/TooltipWrapper';
import {Grid2, Box} from '@mui/material';
import {TimeseriesController} from '~/features/station/createStation/controller/types';

const Form = createTypedForm<SyncFormValues>();

type JupiterDmpSyncProps = {
  mode: 'add' | 'edit' | 'mass_edit';
  loctype_id?: number;
  tstype_id?: number;
  values?: SyncFormValues;
  submit?: (data: SyncFormValues) => void;
  controller?: TimeseriesController;
  onValidChange?: (isValid: boolean, value?: SyncFormValues) => void;
};

const JupiterDmpSync = ({
  loctype_id,
  tstype_id,
  mode,
  values,
  submit,
  controller,
  onValidChange,
}: JupiterDmpSyncProps) => {
  const {syncFormMethods, isDmpAllowed, canSyncJupiter, owners} = useSyncForm<SyncFormValues>({
    mode: mode,
    defaultValues: !controller
      ? {
          jupiter: false,
          sync_dmp: false,
          owner_name: undefined,
          owner_cvr: undefined,
        }
      : controller.getValues().sync,
    context: {
      loctype_id,
      tstype_id,
    },
    values: values,
  });

  const {
    watch,
    trigger,
    setValue,
    getValues,
    reset,
    formState: {isValid, isValidating},
  } = syncFormMethods;
  const sync_dmp = watch('sync_dmp');

  useEffect(() => {
    if (controller)
      controller.registerSlice('sync', true, async () => {
        const isValid = await trigger();
        console.log(isValid);
        return isValid;
      });
  }, []);

  useEffect(() => {
    if (!isValidating && onValidChange) {
      onValidChange(isValid, getValues());
    }
  }, [isValid, isValidating]);

  return (
    <>
      {(canSyncJupiter || isDmpAllowed) && (
        <Form formMethods={syncFormMethods} gridSizes={12}>
          {canSyncJupiter && (
            <TooltipWrapper description="Aktiverer synkronisering af denne tidsserie til Jupiter">
              <Form.Checkbox name="jupiter" label="Jupiter" />
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
                  disabled={(!sync_dmp || values?.sync_dmp) && mode === 'edit'}
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
      )}
    </>
  );
};

export default JupiterDmpSync;
