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
    defaultValues: {
      dmp: null,
      jupiter: null,
    },
    values: {
      ...values,
    },
  });

  const {
    setValue,
    handleSubmit,
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
            <FormToggleButton<SyncFormState, 'jupiter'>
              name="jupiter"
              options={[
                {value: true, label: 'Ja'},
                {value: false, label: 'Nej'},
                {value: null, label: 'Senere'},
              ]}
              gridSizes={12}
              label="Synkroniser til jupiter?"
              size="small"
              direction="row"
              toggleButtonProps={{
                sx: {px: 2},
                size: 'small',
              }}
              gridDirection="row"
              warning={(value) => {
                if (value === undefined && errors.jupiter) {
                  return errors.jupiter.message;
                }
                return '';
              }}
            />
          )}
          {isDmpAllowed && (
            <>
              <FormToggleButton<SyncFormState, 'dmp'>
                name="dmp"
                options={[
                  {value: {}, label: 'Ja'},
                  {value: false, label: 'Nej'},
                  {value: null, label: 'Senere'},
                ]}
                gridSizes={12}
                label="Synkroniser til DMP?"
                size="small"
                direction="row"
                toggleButtonProps={{
                  sx: {px: 2},
                  size: 'small',
                }}
                gridDirection="row"
                onChangeCallback={(value) => {
                  const isActive = value != false && value != undefined;
                  setDmpActive(isActive);
                  console.log('value', value);
                  setValue('dmp', value);
                  // if (!isActive) {
                  //   setValue('dmp', false);
                  // }
                }}
              />

              {dmpActive && (
                <Form.Input
                  select
                  name="dmp.owner_cvr"
                  label="Data ejer"
                  required
                  fullWidth={false}
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
            </>
          )}
        </Form>
      )}
    </>
  );
};

export default SyncForm;
