import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import {Box, InputAdornment, MenuItem, Typography, Select} from '@mui/material';
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
  controls_per_year: z
    .number({required_error: 'Kontrol interval er påkrævet'})
    .refine((val) => (val ? Number(val.toFixed(2)) : null))
    .nullable(),
  lead_time: z.number({required_error: 'Forvarselstid er påkrævet'}).nullable(),
});

type YearlyControlsForm = {
  controls_per_year: number | null;
  lead_time: number | null;
  isCustomerService: boolean | undefined;
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
  const [selectValue, setSelectValue] = React.useState<number>(1);
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
      controls_per_year: values?.controlsPerYear ?? null,
      lead_time: values?.leadTime ?? null,
      isCustomerService: values?.isCustomerService,
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    formState: {isSubmitting, isDirty},
    setValue,
    watch,
  } = formMethods;

  const controlsPerYear = watch('controls_per_year');

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
                  <Select
                    variant="standard"
                    disableUnderline
                    sx={{mb: 0.5, border: 'none'}}
                    value={selectValue}
                    onChange={(e) => {
                      if (controlsPerYear) {
                        if (e.target.value === 1)
                          setValue('controls_per_year', Number((12 / controlsPerYear).toFixed(2)));
                        else if (e.target.value === 2)
                          setValue('controls_per_year', Number((12 / controlsPerYear).toFixed(2)));
                      }
                      setSelectValue(e.target.value as number);
                    }}
                  >
                    <MenuItem value={1}>Kontrol/år</MenuItem>
                    <MenuItem value={2}>Mdr. mellem kontrol</MenuItem>
                  </Select>
                </InputAdornment>
              ),
            },
          }}
          // helperText={
          //   selectValue === 1 && controlsPerYear ? (
          //     <Typography variant="caption">
          //       Kontrolmåles hver {intervalFromFrequencyPerYear(controlsPerYear ?? 0)}
          //     </Typography>
          //   ) : null
          // }
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
