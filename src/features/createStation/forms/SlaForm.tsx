import {zodResolver} from '@hookform/resolvers/zod';
import {Box, InputAdornment} from '@mui/material';
import React, {useEffect} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';
import FormInput from '~/components/FormInput';
import {} from '~/features/station/api/useLocationSLAConfiguration';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useCreateStationStore} from '../state/useCreateStationStore';

const SLASchema = z.object({
  days_to_visitation: z.number({required_error: 'SLA frist er påkrævet'}),
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
  const {isMobile} = useBreakpoints();

  const formMethods = useForm({
    resolver: zodResolver(SLASchema),
    defaultValues: sla ?? {
      days_to_visitation: 30,
    },
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
      <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} alignItems={'center'}>
        <FormInput
          name="days_to_visitation"
          label="Løsningsfrist"
          type="number"
          placeholder="Indtast antal dage..."
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">dage</InputAdornment>,
            },
          }}
          fullWidth
        />
      </Box>
    </FormProvider>
  );
};

export default SlaForm;
