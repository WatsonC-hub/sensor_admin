import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import {Box, InputAdornment} from '@mui/material';
import React from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {z} from 'zod';
import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import {useUser} from '~/features/auth/useUser';
import {
  useLocationSLAConfiguration,
  useLocationSLAConfigurationMutation,
} from '~/features/station/api/useLocationSLAConfiguration';
import useBreakpoints from '~/hooks/useBreakpoints';
import LoadingSkeleton from '~/LoadingSkeleton';
import {useAppContext} from '~/state/contexts';

const SLASchema = z.object({
  days_to_visitation: z.number({required_error: 'SLA frist er påkrævet'}),
  //   lead_time: z.number({required_error: 'Forvarselstid er påkrævet'}).optional(),
});

type SLAForm = {
  days_to_visitation: number | undefined;
};

type SLASubmit = z.infer<typeof SLASchema>;

const SLAConfiguration = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const user = useUser();
  const {data: values, isPending} = useLocationSLAConfiguration(loc_id);
  const {mutate} = useLocationSLAConfigurationMutation(loc_id);
  const {isMobile} = useBreakpoints();

  const formMethods = useForm<SLAForm, unknown, SLASubmit>({
    resolver: zodResolver(SLASchema),
    defaultValues: {
      days_to_visitation: values?.daysToVisitation,
    },
    values: {
      days_to_visitation: values?.daysToVisitation,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: {isSubmitting, isDirty},
  } = formMethods;

  if (isPending) {
    return (
      <Box minWidth={isMobile ? '70vw' : 800}>
        <LoadingSkeleton />
      </Box>
    );
  }

  return (
    <FormProvider {...formMethods}>
      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        gap={2}
        mb={-3}
        alignItems={'center'}
      >
        <FormInput
          name="days_to_visitation"
          label="SLA frist"
          type="number"
          placeholder="Indtast et tal..."
          disabled={
            (values?.isCustomerService && user?.superUser) ||
            (!values?.isCustomerService && !user?.superUser)
          }
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">dage</InputAdornment>,
            },
          }}
          fullWidth
        />

        {/* <FormInput
          name="lead_time"
          label="Forvarselstid"
          type="number"
          disabled={
            (values?.isCustomerService && user?.superUser) ||
            (!values?.isCustomerService && !user?.superUser)
          }
          fullWidth
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">Indenfor</InputAdornment>,
              endAdornment: <InputAdornment position="end">dage før kontrol</InputAdornment>,
            },
          }}
        /> */}
      </Box>

      <Box display="flex" justifyContent="flex-end">
        <Button
          bttype="primary"
          disabled={isSubmitting || !isDirty}
          onClick={handleSubmit((data) => mutate(data))}
          startIcon={<Save />}
        >
          Gem
        </Button>
        <Button
          bttype="tertiary"
          onClick={() => reset()}
          disabled={isSubmitting}
          sx={{marginLeft: 1}}
        >
          Annuller
        </Button>
      </Box>
    </FormProvider>
  );
};

export default SLAConfiguration;
