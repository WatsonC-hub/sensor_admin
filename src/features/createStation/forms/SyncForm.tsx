import React, {useEffect, useState} from 'react';
import {createTypedForm} from '~/components/formComponents/Form';
import useSyncForm from '~/features/synchronization/api/useSyncForm';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {SyncFormState} from '../types';
import Button from '~/components/Button';
import {button_sx} from '../common_style';
import {Stack, Typography} from '@mui/material';

type SyncFormProps = {
  id: string;
  loctype_id?: number;
  tstype_id?: number;
  values: SyncFormState | undefined;
  setValues: (values: SyncFormState) => void;
};

const Form = createTypedForm<SyncFormState>();

const SyncForm = ({id, loctype_id, tstype_id, values, setValues}: SyncFormProps) => {
  const [dmpActive, setDmpActive] = useState(!!values?.dmp && values.dmp !== null);
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
      dmp: values?.dmp ?? null,
      jupiter: values?.jupiter ?? null,
    },
  });

  const {setValue, handleSubmit, watch} = syncFormMethods;

  const watchedDmp = watch('dmp');
  const watchedJupiter = watch('jupiter');

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

  const toggleJupiterOptions = [
    {
      selected: (val: SyncFormState['jupiter']) => val === true,
      onChange: () => {
        setValue('jupiter', true);
      },
      label: 'Ja',
    },
    {
      selected: (val: SyncFormState['jupiter']) => val === false,
      onChange: () => {
        setValue('jupiter', false);
      },
      label: 'Nej',
    },
    {
      selected: (val: SyncFormState['jupiter']) => val === null,
      onChange: () => {
        setValue('jupiter', null);
      },
      label: 'Registrer senere',
    },
  ];

  const toggleDmpOptions = [
    {
      selected: (val: SyncFormState['dmp']) => val !== null && typeof val === 'object',
      onChange: () => {
        setValue('dmp', {});
        setDmpActive(true);
      },
      label: 'Ja',
    },
    {
      selected: (val: SyncFormState['dmp']) => val === false,
      onChange: () => {
        setValue('dmp', false);
        setDmpActive(false);
      },
      label: 'Nej',
    },
    {
      selected: (val: SyncFormState['dmp']) => val === null,
      onChange: () => {
        setValue('dmp', null);
        setDmpActive(false);
      },
      label: 'Registrer senere',
    },
  ];

  return (
    <>
      {(canSyncJupiter || isDmpAllowed) && (
        <Form formMethods={syncFormMethods} gridSizes={12}>
          {canSyncJupiter && (
            <Stack direction={'column'}>
              <Typography gutterBottom>Synkroniser til Jupiter?</Typography>
              <Stack direction={'row'} spacing={1}>
                {toggleJupiterOptions.map((option) => (
                  <Button
                    key={option.label}
                    onClick={option.onChange}
                    size="small"
                    bttype={option.selected(watchedJupiter) ? 'primary' : 'tertiary'}
                  >
                    {option.label}
                  </Button>
                ))}
              </Stack>
            </Stack>
          )}
          {isDmpAllowed && (
            <>
              <Stack direction={'column'}>
                <Typography>Skal stationen synkroniseres med DMP?</Typography>
                <Stack direction={'row'} spacing={1}>
                  {toggleDmpOptions.map((option) => (
                    <Button
                      key={option.label}
                      onClick={option.onChange}
                      bttype={option.selected(watchedDmp) ? 'primary' : 'tertiary'}
                      sx={{...button_sx(option.selected(watchedDmp))}}
                    >
                      {option.label}
                    </Button>
                  ))}
                </Stack>
              </Stack>

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
