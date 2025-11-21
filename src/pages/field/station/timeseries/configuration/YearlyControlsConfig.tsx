import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import {Box, InputAdornment, Typography} from '@mui/material';
import React, {ChangeEvent} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import FormInput from '~/components/FormInput';
import useBreakpoints from '~/hooks/useBreakpoints';
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
  // .refine((val) => (val == null ? null : val), 'Kontrol interval skal være et tal'),
  dummy: z.number().nullish().optional(),
  lead_time: z.number({required_error: 'Forvarselstid er påkrævet'}).nullable(),
  selectValue: z.number().default(1),
});

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
  const {data: values} = useTimeseriesServiceInterval(ts_id);
  const {mutate} = useTimeseriesServiceIntervalMutation(ts_id);
  const {isMobile} = useBreakpoints();

  const formMethods = useForm<ServiceIntervalSubmit>({
    resolver: zodResolver(yearlyControlsSchema),
    defaultValues: {
      controls_per_year: null,
      dummy: null,
      lead_time: null,
    },
    values: values && {
      controls_per_year: values.controlsPerYear,
      lead_time: values.leadTime ?? null,
      dummy: values.controlsPerYear ? Number(values.controlsPerYear.toFixed(3)) : null,
      selectValue: 1,
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    formState: {isSubmitting, dirtyFields},
    setValue,
    watch,
  } = formMethods;

  const controlsPerYear = watch('controls_per_year');
  const selectValue = watch('selectValue');

  const onSubmit = (data: ServiceIntervalSubmit) => {
    mutate(
      {
        controls_per_year: data.dummy !== null ? data.controls_per_year : null,
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
          name="dummy"
          label="Kontrolhyppighed"
          type="number"
          disabled={
            (values?.isCustomerService && user?.superUser) ||
            (!values?.isCustomerService && !user?.superUser)
          }
          fullWidth
          onChangeCallback={(e) => {
            if (typeof e == 'number') {
              if (selectValue === 1) setValue('controls_per_year', Number(e), {shouldDirty: true});
              else if (selectValue === 2 && Number(e) !== 0)
                setValue('controls_per_year', Number((12 / Number(e)).toFixed(3)), {
                  shouldDirty: true,
                });
            }
          }}
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
                    disabled={
                      (values?.isCustomerService && user?.superUser) ||
                      (!values?.isCustomerService && !user?.superUser)
                    }
                    slotProps={{
                      select: {
                        disableUnderline: true,
                      },
                    }}
                    options={[{1: 'kontrol/år'}, {2: 'mdr. mellem kontrol'}]}
                    keyType="number"
                    onChangeCallback={(e) => {
                      const value = (e as ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
                        .target.value;
                      if (controlsPerYear) {
                        if (Number(value) === 1)
                          setValue('dummy', controlsPerYear, {
                            shouldDirty: false,
                          });
                        else if (Number(value) === 2)
                          setValue('dummy', Number((12 / controlsPerYear).toFixed(3)), {
                            shouldDirty: false,
                          });
                      }
                    }}
                  />
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
                  Kontrolmåles {controlsPerYear} gange om året
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
          disabled={
            isSubmitting ||
            Object.keys(dirtyFields).filter((key) => key !== 'selectValue').length === 0
          }
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

export default YearlyControlsConfig;
