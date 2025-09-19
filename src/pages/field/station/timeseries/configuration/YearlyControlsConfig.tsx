import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import {Box, InputAdornment, MenuItem, Typography} from '@mui/material';
import React, {ChangeEvent} from 'react';
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
  controls_per_year: z.number({required_error: 'Kontrol interval er påkrævet'}).nullable(),
  lead_time: z.number({required_error: 'Forvarselstid er påkrævet'}).nullable(),
  selectValue: z.number().default(1),
});

type YearlyControlsForm = {
  controls_per_year: number | null;
  lead_time: number | null;
  isCustomerService: boolean | undefined;
  selectValue: number;
};

type ServiceIntervalSubmit = z.infer<typeof yearlyControlsSchema>;

function intervalFromFrequencyPerYear(timesPerYear: number): string {
  if (timesPerYear <= 0) return 'Ingen interval';

  const months = 12 / timesPerYear;

  // Round to 1 decimal if it's not an integer
  const display = Number.isInteger(months) ? months : months.toFixed(1);

  if (months === 1) return 'måned';
  return `${display}. måned`;
}

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
      lead_time: values?.leadTime,
    },
    values: {
      controls_per_year: values?.controlsPerYear === undefined ? null : values.controlsPerYear,
      lead_time: values?.leadTime === undefined ? null : values.leadTime,
      isCustomerService: values?.isCustomerService,
      selectValue: 1,
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    formState: {isSubmitting, isDirty, dirtyFields},
    setValue,
    watch,
  } = formMethods;

  console.log(dirtyFields);
  const controlsPerYear = watch('controls_per_year');
  const selectValue = watch('selectValue');

  if (isPending) {
    return (
      <Box minWidth={isMobile ? '70vw' : 800}>
        <LoadingSkeleton />
      </Box>
    );
  }

  const onSubmit = (data: ServiceIntervalSubmit) => {
    if (data.selectValue === 2 && data.controls_per_year)
      data.controls_per_year = Number((12 / data.controls_per_year).toFixed(2));

    mutate(
      {
        controls_per_year: data.controls_per_year,
        lead_time: data.lead_time,
      },
      {
        onSuccess: () => reset(),
      }
    );
  };

  return (
    <FormProvider {...formMethods}>
      <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} alignItems={'center'}>
        <FormInput
          name="controls_per_year"
          label="Kontrolhyppighed"
          type="number"
          disabled={
            (values?.isCustomerService && user?.superUser) ||
            (!values?.isCustomerService && !user?.superUser)
          }
          fullWidth
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <FormInput
                    name="selectValue"
                    select
                    variant="standard"
                    sx={{width: 150}}
                    defaultValue={1}
                    slotProps={{
                      select: {
                        disableUnderline: true,
                      },
                    }}
                    onChangeCallback={(e) => {
                      const value = (e as ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
                        .target.value;
                      if (controlsPerYear) {
                        if (Number(value) === 1)
                          setValue('controls_per_year', Number((12 / controlsPerYear).toFixed(2)));
                        else if (Number(value) === 2)
                          setValue('controls_per_year', Number((12 / controlsPerYear).toFixed(2)));
                      }
                    }}
                  >
                    <MenuItem value={1}>kontrol/år</MenuItem>
                    <MenuItem value={2}>mdr. mellem kontrol</MenuItem>
                  </FormInput>
                </InputAdornment>
              ),
            },
          }}
          helperText={
            controlsPerYear ? (
              selectValue === 1 ? (
                <Typography variant="caption">
                  Kontrolmåles hver {intervalFromFrequencyPerYear(controlsPerYear ?? 0)}
                </Typography>
              ) : (
                <Typography variant="caption">
                  Kontrolmåles {Number((12 / controlsPerYear).toFixed(2))} gange om året
                </Typography>
              )
            ) : null
          }
        />

        <FormInput
          name="lead_time"
          label="Forsvarsling"
          type="number"
          disabled={
            (values?.isCustomerService && user?.superUser) ||
            (!values?.isCustomerService && !user?.superUser)
          }
          fullWidth
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">dage før kontrol</InputAdornment>,
            },
          }}
        />
      </Box>

      <Box display="flex" justifyContent="flex-end">
        <Button
          bttype="primary"
          disabled={isSubmitting || !isDirty}
          onClick={handleSubmit(onSubmit, (error) => console.log(error))}
          startIcon={<Save />}
        >
          Gem
        </Button>
        <Button
          bttype="tertiary"
          onClick={() => {
            reset();
          }}
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
