import {Box, Checkbox, FormControlLabel} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {createTypedForm} from '~/components/formComponents/Form';
import TooltipWrapper from '~/components/TooltipWrapper';
import useSyncForm, {SyncFormSchema} from '~/features/synchronization/api/useSyncForm';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {SyncFormState} from '../types';

type SyncFormProps = {
  id: string;
  loctype_id?: number;
  tstype_id?: number;
  values: SyncFormState | undefined;
  setValues: (values: SyncFormState) => void;
};

const Form = createTypedForm<SyncFormSchema>();

const SyncForm = ({id, loctype_id, tstype_id, values, setValues}: SyncFormProps) => {
  const [dmpActive, setDmpActive] = useState(!!values?.dmp);
  const [registerSubmitter, removeSubmitter] = useCreateStationStore((state) => [
    state.registerSubmitter,
    state.removeSubmitter,
  ]);
  const {syncFormMethods, isDmpAllowed, canSyncJupiter, owners} = useSyncForm({
    context: {
      loctype_id,
      tstype_id,
    },
    values: {
      dmp: false,
      jupiter: false,
      ...values,
    },
  });

  const {setValue, handleSubmit, reset} = syncFormMethods;

  useEffect(() => {
    registerSubmitter(id, async () => {
      let valid: boolean = false;
      await handleSubmit((values) => {
        if (!isDmpAllowed) delete values.dmp;
        if (!canSyncJupiter) delete values.jupiter;

        setValues(values);
        valid = true;
      })();
      return valid;
    });

    return () => removeSubmitter(id);
  }, [handleSubmit, isDmpAllowed, canSyncJupiter]);

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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={dmpActive}
                    sx={{
                      width: 'fit-content',
                    }}
                    onChange={(e) => {
                      setDmpActive(e.target.checked);
                      if (e.target.checked) {
                        reset({dmp: {}});
                      } else {
                        reset({dmp: false});
                      }
                    }}
                  />
                }
                label={'DMP'}
              />
              {dmpActive && (
                <Form.Input
                  select
                  name="dmp.owner_cvr"
                  label="Data ejer"
                  required
                  disabled={!dmpActive}
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
                      setValue('dmp.owner_cvr', parseInt(owner.cvr), {shouldValidate: true});
                      setValue('dmp.owner_name', owner.name, {shouldValidate: true});
                    }
                  }}
                />
              )}
            </Box>
          )}
        </Form>
      )}
    </>
  );
};

export default SyncForm;
