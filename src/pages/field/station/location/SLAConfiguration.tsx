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
import UpdateProgressButton from '~/features/station/components/UpdateProgressButton';
import {useStationProgress} from '~/hooks/query/stationProgress';
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
  const {superUser} = useUser();
  const {data: values, isPending} = useLocationSLAConfiguration(loc_id);
  const {mutate} = useLocationSLAConfigurationMutation(loc_id);
  const {isMobile} = useBreakpoints();
  const {hasAssessed, needsProgress} = useStationProgress(loc_id, 'sla', -1);

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
      <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} alignItems={'center'}>
        <FormInput
          name="days_to_visitation"
          label="Løsningsfrist"
          type="number"
          placeholder="Indtast antal dage..."
          disabled={
            (values?.isCustomerService && superUser) || (!values?.isCustomerService && !superUser)
          }
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">dage</InputAdornment>,
            },
          }}
          fullWidth
        />
      </Box>

      <Box display="flex" justifyContent="flex-end" gap={1}>
        <UpdateProgressButton loc_id={loc_id} ts_id={-1} progressKey="sla" />
        <Button
          bttype="primary"
          disabled={isSubmitting || !isDirty}
          onClick={handleSubmit((data) =>
            mutate(data, {
              onSuccess: () => {
                if (needsProgress) hasAssessed();
              },
            })
          )}
          startIcon={<Save />}
        >
          Gem
        </Button>
        <Button bttype="tertiary" onClick={() => reset()} disabled={isSubmitting}>
          Annuller
        </Button>
      </Box>
    </FormProvider>
  );
};

export default SLAConfiguration;
