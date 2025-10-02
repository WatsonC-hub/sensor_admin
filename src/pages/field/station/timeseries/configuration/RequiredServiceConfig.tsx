import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import {Box, Checkbox, FormControlLabel} from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import {z} from 'zod';
import Button from '~/components/Button';
import useRequiredService, {
  useRequiredServiceMutation,
} from '~/features/station/api/useRequiredService';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import LoadingSkeleton from '~/LoadingSkeleton';
import {useAppContext} from '~/state/contexts';

const requiredServiceSchema = z.object({
  required_service: z.boolean().default(false),
});

type RequiredServiceForm = {
  required_service: boolean | undefined;
};

const RequiredServiceConfig = () => {
  const {ts_id} = useAppContext(['ts_id']);
  const {data: values, isPending} = useRequiredService(ts_id);
  const {data: timeseries} = useTimeseriesData(ts_id);
  const {mutate} = useRequiredServiceMutation(ts_id);
  const {isMobile} = useBreakpoints();

  const formMethods = useForm<RequiredServiceForm>({
    resolver: zodResolver(requiredServiceSchema),
    defaultValues: {
      required_service: values?.required_service,
    },
    mode: 'onTouched',
    values: {
      required_service: values?.required_service,
    },
  });

  const {
    handleSubmit,
    control,
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

  const onSubmit = (data: RequiredServiceForm) => {
    mutate(data);
  };

  return (
    <FormProvider {...formMethods}>
      <Box display={'flex'}>
        <Controller
          control={control}
          name="required_service"
          render={({field}) => (
            <FormControlLabel
              control={<Checkbox {...field} checked={field.value} />}
              label="Skal driftes"
              disabled={dayjs(timeseries?.slutdato).isAfter(dayjs())}
            />
          )}
        />
      </Box>
      <Box display="flex" justifyContent="flex-end">
        <Button
          bttype="tertiary"
          onClick={() => {
            reset();
          }}
          disabled={isSubmitting}
        >
          Annuller
        </Button>
        <Button
          bttype="primary"
          disabled={isSubmitting || !isDirty}
          onClick={handleSubmit(onSubmit, (error) => console.log(error))}
          startIcon={<Save />}
          sx={{marginLeft: 1}}
        >
          Gem
        </Button>
      </Box>
    </FormProvider>
  );
};

export default RequiredServiceConfig;
