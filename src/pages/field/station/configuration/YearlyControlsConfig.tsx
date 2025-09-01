import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import {Box, InputAdornment} from '@mui/material';
import React from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import FormInput from '~/components/FormInput';
import useBreakpoints from '~/hooks/useBreakpoints';
import LoadingSkeleton from '~/LoadingSkeleton';
import {useAppContext} from '~/state/contexts';
import {
  useTimeseriesServiceInterval,
  useTimeseriesServiceIntervalMutation,
} from '~/features/station/api/useTimeseriesServiceInterval';
import {z} from 'zod';
import Button from '~/components/Button';
import {useUser} from '~/features/auth/useUser';

const yearlyControlsSchema = z.object({
  controls_per_year: z.number({required_error: 'Kontrol interval er påkrævet'}),
  lead_time: z.number({required_error: 'Forvarselstid er påkrævet'}).optional(),
});

type YearlyControlsForm = {
  controls_per_year: number | undefined;
  lead_time: number | undefined;
  isCustomerService: boolean | undefined;
};

type ServiceIntervalSubmit = z.infer<typeof yearlyControlsSchema>;

const YearlyControlsConfig = () => {
  const {ts_id} = useAppContext(['ts_id']);
  const user = useUser();
  const {data: values, isPending} = useTimeseriesServiceInterval(ts_id);
  const {mutate} = useTimeseriesServiceIntervalMutation(ts_id);
  const {isMobile} = useBreakpoints();

  const formMethods = useForm<YearlyControlsForm, unknown, ServiceIntervalSubmit>({
    resolver: zodResolver(yearlyControlsSchema),
    defaultValues: {
      controls_per_year: values?.controlsPerYear,
      isCustomerService: values?.isCustomerService,
    },
    values: {
      controls_per_year: values?.controlsPerYear,
      lead_time: values?.leadTime,
      isCustomerService: values?.isCustomerService,
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
          name="controls_per_year"
          label="Kontrol interval"
          type="number"
          // is_customer_service and !super_user = false
          // !is_customer_service and !super_user = true
          // !is_customer_service and super_user = false
          // is_customer_service and super_user = true
          disabled={
            (values?.isCustomerService && user?.superUser) ||
            (!values?.isCustomerService && !user?.superUser)
          }
          fullWidth
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="start">kontrol/år</InputAdornment>,
            },
          }}
        />

        <FormInput
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
        />
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

export default YearlyControlsConfig;
