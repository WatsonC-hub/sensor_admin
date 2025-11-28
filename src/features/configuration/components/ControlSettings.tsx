import {InputAdornment, Typography} from '@mui/material';
import React, {ChangeEvent, createContext} from 'react';
import {useFormContext} from 'react-hook-form';
import FormInput from '~/components/FormInput';
import {useUser} from '~/features/auth/useUser';

type Props = {
  children: React.ReactNode;
  ts_ids?: Array<number>;
};

type ControlSettingsContextProps = {
  ts_ids?: Array<number>;
};

const ControlSettingsContext = createContext<ControlSettingsContextProps | undefined>(undefined);

const ControlSettings = ({children, ts_ids}: Props) => {
  return (
    <ControlSettingsContext.Provider value={{ts_ids}}>{children}</ControlSettingsContext.Provider>
  );
};

function intervalFromFrequencyPerYear(timesPerYear: number): string {
  if (timesPerYear <= 0) return 'Ingen interval';

  const months = 12 / timesPerYear;

  // Round to 1 decimal if it's not an integer
  const display = Number.isInteger(months) ? months : months.toFixed(1);

  if (months === 1) return 'måned';
  return `${display}. måned`;
}

const IntervalType = () => {
  const {superUser} = useUser();
  const {getValues, setValue} = useFormContext();
  const values = getValues();

  const controlsPerYear = values['controls_per_year'];
  return (
    <FormInput
      name="selectValue"
      select
      variant="standard"
      sx={{width: 150}}
      defaultValue={1}
      disabled={
        (values?.isCustomerService && superUser) || (!values?.isCustomerService && !superUser)
      }
      slotProps={{
        select: {
          disableUnderline: true,
        },
      }}
      options={[{1: 'kontrol/år'}, {2: 'mdr. mellem kontrol'}]}
      keyType="number"
      onChangeCallback={(e) => {
        const value = (e as ChangeEvent<HTMLInputElement | HTMLTextAreaElement>).target.value;
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
  );
};

const ControlFrequency = () => {
  const {superUser} = useUser();
  const {getValues, setValue, watch} = useFormContext();
  const values = getValues();
  const controlsPerYear = watch('controls_per_year');
  const selectValue = watch('selectValue');
  return (
    <FormInput
      name="dummy"
      label="Kontrolhyppighed"
      type="number"
      disabled={
        (values?.isCustomerService && superUser) || (!values?.isCustomerService && !superUser)
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
              <IntervalType />
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
            <Typography variant="caption">Kontrolmåles {controlsPerYear} gange om året</Typography>
          )
        ) : null
      }
    />
  );
};

const LeadTime = () => {
  const {superUser} = useUser();
  const {getValues} = useFormContext();
  const values = getValues();
  return (
    <FormInput
      name="lead_time"
      label="Forvarsling"
      type="number"
      disabled={
        (values?.isCustomerService && superUser) || (!values?.isCustomerService && !superUser)
      }
      fullWidth
      slotProps={{
        input: {
          endAdornment: <InputAdornment position="end">dage før kontrol</InputAdornment>,
        },
      }}
    />
  );
};

ControlSettings.ControlFrequency = ControlFrequency;
ControlSettings.IntervalType = IntervalType;
ControlSettings.LeadTime = LeadTime;

export default ControlSettings;
