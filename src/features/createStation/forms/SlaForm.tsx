import {zodResolver} from '@hookform/resolvers/zod';
import {Box, InputAdornment} from '@mui/material';
import React, {useEffect} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';
import FormInput from '~/components/FormInput';
import {} from '~/features/station/api/useLocationSLAConfiguration';
import {useCreateStationStore} from '../state/useCreateStationStore';
import Button from '~/components/Button';
import {RadioButtonCheckedOutlined, RadioButtonUncheckedOutlined} from '@mui/icons-material';
import useBreakpoints from '~/hooks/useBreakpoints';
import {button_sx} from '../common_style';

const SLASchema = z.object({
  days_to_visitation: z
    .number({
      message: 'Løsningsfrist skal være et tal',
    })
    .min(1, {message: 'Løsningsfrist skal være 1 eller flere dage'}),
});

type SLA = z.infer<typeof SLASchema>;

type SLAFormState = {
  days_to_visitation: number | null;
};

type SlaFormProps = {
  setValues: (values: SLA) => void;
};

const SlaForm = ({setValues}: SlaFormProps) => {
  const {isMobile} = useBreakpoints();
  const [sla, registerSubmitter, removeSubmitter, deleteState] = useCreateStationStore((state) => [
    state.formState.location?.sla,
    state.registerSubmitter,
    state.removeSubmitter,
    state.deleteState,
  ]);

  const formMethods = useForm<SLAFormState, unknown, SLA>({
    resolver: zodResolver(SLASchema),
    defaultValues: sla,
  });

  const {handleSubmit, reset, getValues} = formMethods;

  const onChangeCallback = () => {
    const values = getValues();
    setValues(values as SLA);
    registerSubmitter('location.sla', async () => {
      let valid: boolean = false;
      await handleSubmit((values) => {
        setValues(values);
        valid = true;
      })();
      return valid;
    });
  };

  useEffect(() => {
    if (sla !== undefined)
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
    <Box
      display="flex"
      gap={1}
      flexDirection={isMobile ? 'column' : 'row'}
      alignContent={isMobile ? 'end' : 'center'}
    >
      <FormProvider {...formMethods}>
        <FormInput
          name="days_to_visitation"
          label="Løsningsfrist"
          type="number"
          disabled={sla === undefined}
          required
          placeholder="Indtast antal dage..."
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">dage</InputAdornment>,
            },
          }}
          onChangeCallback={onChangeCallback}
          fullWidth={false}
        />
      </FormProvider>
      <Button
        bttype="primary"
        startIcon={
          sla === undefined ? <RadioButtonCheckedOutlined /> : <RadioButtonUncheckedOutlined />
        }
        sx={{
          ...button_sx(sla === undefined),
          alignSelf: isMobile ? 'start' : 'center',
        }}
        onClick={() => {
          if (sla === undefined) onChangeCallback();
          else {
            deleteState('location.sla');
            reset({
              days_to_visitation: null,
            });
            removeSubmitter('location.sla');
          }
        }}
      >
        Registrer senere
      </Button>
    </Box>
  );
};

export default SlaForm;
