import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import {Box, Grid2, InputAdornment, Typography} from '@mui/material';
import React from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {z} from 'zod';
import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import usePermissions from '~/features/permissions/api/usePermissions';
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
});

type SLAForm = {
  days_to_visitation: number | undefined;
};

type SLASubmit = z.infer<typeof SLASchema>;

const SLAConfiguration = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const {data: values, isPending} = useLocationSLAConfiguration(loc_id);
  const {mutate} = useLocationSLAConfigurationMutation(loc_id);
  const {isMobile} = useBreakpoints();
  const {hasAssessed, needsProgress} = useStationProgress(loc_id, 'sla', -1);
  const {location_permissions} = usePermissions(loc_id);

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
          disabled={location_permissions !== 'edit'}
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">dage</InputAdornment>,
            },
          }}
          fullWidth
        />
      </Box>

      <Grid2 size={12} display="flex" justifyContent={'flex-end'} gap={1}>
        <UpdateProgressButton
          loc_id={loc_id}
          disabled={isDirty || location_permissions !== 'edit'}
          ts_id={-1}
          progressKey="sla"
        />
        <Button
          bttype="tertiary"
          disabled={isSubmitting || !isDirty || location_permissions !== 'edit'}
          onClick={() => reset()}
        >
          <Typography variant="body2">Annuller</Typography>
        </Button>
        <Button
          bttype="primary"
          disabled={isSubmitting || !isDirty || location_permissions !== 'edit'}
          onClick={handleSubmit((data) =>
            mutate(data, {
              onSuccess: () => {
                if (needsProgress) hasAssessed();
              },
            })
          )}
          startIcon={<Save />}
        >
          <Typography variant="body2">Gem</Typography>
        </Button>
      </Grid2>
    </FormProvider>
  );
};

export default SLAConfiguration;
