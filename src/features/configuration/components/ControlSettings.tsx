import {InputAdornment, Select, Typography, MenuItem} from '@mui/material';
import React, {createContext, useState} from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import FormInput, {FormInputProps} from '~/components/FormInput';
import {ControlSettingsFormValues} from '../api/useControlSettingsForm';
import FormTextField, {FormTextFieldProps} from '~/components/FormTextField';

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

type IntervalTypeProps = {
  value: 1 | 2;
  setValue: (value: 1 | 2) => void;
};

const IntervalType = ({value, setValue}: IntervalTypeProps) => {
  return (
    <>
      <Select value={value} variant="standard" sx={{width: 125}} disableUnderline>
        <MenuItem value={1} onClick={() => setValue(1)}>
          kontrol/år
        </MenuItem>
        <MenuItem value={2} onClick={() => setValue(2)}>
          mdr. mellem kontrol
        </MenuItem>
      </Select>
    </>
  );
};

export type ControlSettingsProps = {
  selectValue?: 1 | 2;
  setSelectValue?: (value: 1 | 2) => void;
  disabled?: boolean;
} & Omit<FormTextFieldProps, 'label' | 'value'>;

const ControlFrequency = ({
  selectValue,
  setSelectValue,
  disabled = false,
  ...rest
}: ControlSettingsProps) => {
  const {control} = useFormContext();

  const [intervalType, setIntervalType] = useState<1 | 2>(selectValue ?? 1);

  return (
    <>
      <Controller
        name="controls_per_year"
        control={control}
        render={({field: {onChange, value}, fieldState: {error}}) => {
          let innerValue = undefined;

          if (value !== undefined && value !== null && value !== '')
            innerValue = intervalType === 1 ? value : Number((12 / value).toFixed(3));

          const interval = intervalFromFrequencyPerYear(value ?? 0);
          return (
            <FormTextField
              label="Kontrolhyppighed"
              type="number"
              value={innerValue ?? ''}
              onChange={(e) => {
                const inputValue = e.target.value;
                let newValue: number | string = '';
                if (intervalType === 1 && inputValue !== '') {
                  newValue = Number(inputValue);
                } else if (intervalType === 2 && inputValue !== '') {
                  newValue = Number((12 / Number(inputValue)).toFixed(3));
                }

                onChange(newValue);
              }}
              disabled={disabled}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IntervalType
                        value={intervalType}
                        setValue={(value) => {
                          if (setSelectValue) setSelectValue(value);
                          setIntervalType(value);
                        }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
              helperText={
                error ? (
                  error.message
                ) : value ? (
                  intervalType === 1 ? (
                    interval === 'Ingen interval' ? (
                      <Typography variant="caption">{interval}</Typography>
                    ) : (
                      <Typography variant="caption">Kontrolmåles hver {interval}</Typography>
                    )
                  ) : (
                    <Typography variant="caption">Kontrolmåles {value} gange om året</Typography>
                  )
                ) : null
              }
              error={!!error}
              formError={error}
              {...rest}
            />
          );
        }}
      />
    </>
  );
};

type LeadTimeProps = Omit<FormInputProps<ControlSettingsFormValues>, 'name'>;

const LeadTime = ({onChangeCallback, ...rest}: LeadTimeProps) => {
  return (
    <FormInput
      {...rest}
      name="lead_time"
      label="Forvarsling"
      type="number"
      fullWidth
      slotProps={{
        input: {
          endAdornment: <InputAdornment position="end">dage før kontrol</InputAdornment>,
        },
      }}
      onChangeCallback={onChangeCallback}
    />
  );
};

ControlSettings.ControlFrequency = ControlFrequency;
ControlSettings.IntervalType = IntervalType;
ControlSettings.LeadTime = LeadTime;

export default ControlSettings;
