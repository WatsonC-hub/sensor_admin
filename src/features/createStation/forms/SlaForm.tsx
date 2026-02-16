import {zodResolver} from '@hookform/resolvers/zod';
import {InputAdornment} from '@mui/material';
import React, {useEffect} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';
import FormInput from '~/components/FormInput';
import {} from '~/features/station/api/useLocationSLAConfiguration';
import {useCreateStationStore} from '../state/useCreateStationStore';

const SLASchema = z.object({
  days_to_visitation: z
    .number({
      message: 'Løsningsfrist skal være et tal',
    })
    .min(1, {message: 'Løsningsfrist skal være 1 eller flere dage'}),
});

type SlaFormProps = {
  setValues: (values: z.infer<typeof SLASchema>) => void;
};

const SlaForm = ({setValues}: SlaFormProps) => {
  const [sla, registerSubmitter, removeSubmitter] = useCreateStationStore((state) => [
    state.formState.location?.sla,
    state.registerSubmitter,
    state.removeSubmitter,
  ]);

  const formMethods = useForm({
    resolver: zodResolver(SLASchema),
    defaultValues: sla,
  });

  const {handleSubmit} = formMethods;

  useEffect(() => {
    registerSubmitter('location.sla', async () => {
      let valid: boolean = false;
      await handleSubmit((values) => {
        setValues(values);
        valid = true;
      })();
      return valid;
    });

    return () => removeSubmitter('location.sla');
  }, [handleSubmit]);

  return (
    <FormProvider {...formMethods}>
      <FormInput
        name="days_to_visitation"
        label="Løsningsfrist"
        type="number"
        required
        placeholder="Indtast antal dage..."
        slotProps={{
          input: {
            endAdornment: <InputAdornment position="end">dage</InputAdornment>,
          },
        }}
        sx={{
          width: 'fit-content',
        }}
        fullWidth
      />
    </FormProvider>
  );
};

export default SlaForm;
