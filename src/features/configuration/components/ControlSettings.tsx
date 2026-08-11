import {InputAdornment, MenuItem, Select, Typography} from '@mui/material';
import React, {createContext, useState} from 'react';
import {Controller, useFormContext} from 'react-hook-form';

import FormInput from '~/components/FormInput';
import FormTextField from '~/components/FormTextField';

import type {ControlSettingsFormValues} from '../api/useControlSettingsForm';
import type {FormInputProps} from '~/components/FormInput';
import type {FormTextFieldProps} from '~/components/FormTextField';

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
  disabled?: boolean;
};

const IntervalType = ({value, setValue, disabled = false}: IntervalTypeProps) => {
  return (
    <Select
      value={value}
      disabled={disabled}
      variant="standard"
      sx={{
        width: 125,
        '&.Mui-disabled .MuiSelect-select': {
          WebkitTextFillColor: disabled ? 'GrayText' : 'inherit',
          color: disabled ? 'GrayText' : 'inherit',
        },
      }}
      disableUnderline
    >
      <MenuItem value={1} onClick={() => setValue(1)}>
        kontrol/år
      </MenuItem>
      <MenuItem value={2} onClick={() => setValue(2)}>
        mdr. mellem kontrol
      </MenuItem>
    </Select>
  );
};

export type ControlSettingsProps = {
  selectValue?: 1 | 2;
  setSelectValue?: (value: 1 | 2) => void;
  onChangeCallback?: () => void;
} & Omit<FormTextFieldProps, 'label' | 'value'>;

const ControlFrequency = ({
  selectValue,
  setSelectValue,
  disabled = false,
  onChangeCallback,
  ...rest
}: ControlSettingsProps) => {
  const {control} = useFormContext();

  const [intervalType, setIntervalType] = useState<1 | 2>(selectValue ?? 1);

  return (
    <>
      <Controller
        name="controls_per_year"
        control={control}
        render={({field: {onChange, onBlur, value}, fieldState: {error}}) => {
          let innerValue = undefined;
          if (value !== undefined && value !== null && value !== '')
            innerValue = intervalType === 1 ? value.toFixed(1) : Number((12 / value).toFixed(1));

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
                  newValue = 12 / Number(inputValue);
                }
                console.log(
                  'intervalType',
                  intervalType,
                  'inputValue',
                  inputValue,
                  'newValue',
                  newValue
                );
                onChange(newValue);

                if (onChangeCallback) {
                  onChangeCallback();
                }
              }}
              onBlur={onBlur}
              disabled={disabled}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IntervalType
                        disabled={disabled}
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
                    <Typography variant="caption">
                      Kontrolmåles {value.toFixed(1)} gange om året
                    </Typography>
                  )
                ) : null
              }
              formError={error}
              {...rest}
            />
          );
        }}
      />
    </>
  );
};

export type LeadTimeProps = Omit<FormInputProps<ControlSettingsFormValues>, 'name'>;

const LeadTime = ({onChangeCallback, disabled, ...rest}: LeadTimeProps) => {
  const {getValues} = useFormContext<ControlSettingsFormValues>();
  const controls_per_year = getValues('controls_per_year');
  return (
    <FormInput
      {...rest}
      name="lead_time"
      label="Forvarsling"
      type="number"
      fullWidth
      disabled={disabled}
      placeholder={
        controls_per_year ? `${Math.floor(Math.min(2, (12 / controls_per_year) * 0.25) * 31)}` : ''
      }
      slotProps={{
        input: {
          disabled: disabled,
          endAdornment: (
            <InputAdornment position="end" disableTypography={disabled}>
              <Typography>dage før kontrol</Typography>
            </InputAdornment>
          ),
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
