import {Box, Checkbox, FormControlLabel} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {createTypedForm} from '~/components/formComponents/Form';
import useSyncForm from '~/features/synchronization/api/useSyncForm';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {SyncFormState} from '../types';
import FormToggleButton from '~/components/formComponents/FormToggleButton';

type SyncFormProps = {
  id: string;
  loctype_id?: number;
  tstype_id?: number;
  values: SyncFormState | undefined;
  setValues: (values: SyncFormState) => void;
};

const Form = createTypedForm<SyncFormState>();

const SyncForm = ({id, loctype_id, tstype_id, values, setValues}: SyncFormProps) => {
  const [dmpActive, setDmpActive] = useState(!!values?.dmp);
  const [registerSubmitter, removeSubmitter] = useCreateStationStore((state) => [
    state.registerSubmitter,
    state.removeSubmitter,
  ]);
  const {syncFormMethods, isDmpAllowed, canSyncJupiter, owners} = useSyncForm<SyncFormState>({
    context: {
      loctype_id,
      tstype_id,
    },
    values: {
      ...values,
    },
  });

  const {
    setValue,
    handleSubmit,
    reset,
    formState: {errors},
  } = syncFormMethods;

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
            <FormToggleButton<SyncFormState>
              name="jupiter"
              options={[
                {value: true, label: 'Ja'},
                {value: false, label: 'Nej'},
              ]}
              gridSizes={12}
              label="Synkronisere til jupiter?"
              size="small"
              direction="row"
              toggleButtonProps={{
                sx: {px: 2},
                size: 'small',
              }}
              onChangeCallback={(val) => val}
              gridDirection="row"
              warning={() => {
                if (errors.jupiter) {
                  return errors.jupiter.message;
                }
                return '';
              }}
            />
          )}
          {isDmpAllowed && (
            <Box>
              <FormToggleButton<SyncFormState>
                name="dmp"
                options={[
                  {value: false, label: 'Nej'},
                  {value: "ghehj", label: 'Ja'},
                ]}
                gridSizes={12}
                label="Synkronisere til DMP?"
                size="small"
                direction="row"
                toggleButtonProps={{
                  sx: {px: 2},
                  size: 'small',
                }}
                gridDirection="row"
                warning={() => {
                  if (errors.dmp) {
                    return errors.dmp.message;
                  }
                  return '';
                }}
                onChangeCallback={(value) => {
                  const isActive = value !== false && value !== undefined;
                  setDmpActive(isActive);
                  if (!isActive) {
                    setValue('dmp', false);
                  }
                }}
              />
              {/* <FormControlLabel
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
              /> */}
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
