import type {SwitchProps, SxProps} from '@mui/material';
import {Switch, FormControlLabel} from '@mui/material';
import React from 'react';
import type {FieldValues, Path} from 'react-hook-form';
import {Controller, useFormContext} from 'react-hook-form';

type FormToggleSwitchProps<TFieldValues extends FieldValues> = SwitchProps & {
  name: Path<TFieldValues>;
  warning?: (value: any) => string;
  children?: React.ReactNode;
  rules?: any;
  label: string;
  onChangeCallback?: (value: any) => void;
  sx?: SxProps;
};

const FormToggleSwitch = <TFieldValues extends FieldValues>({
  name,
  rules,
  onChangeCallback,
  label,
  sx,
  ...otherProps
}: FormToggleSwitchProps<TFieldValues>) => {
  const {control} = useFormContext<TFieldValues>();
  return (
    <>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({field: {value, onChange, ref, name}}) => {
          return (
            <FormControlLabel
              sx={sx}
              control={
                <Switch
                  ref={ref}
                  checked={value}
                  size="small"
                  color="primary"
                  aria-label={name}
                  onChange={(e, value) => {
                    if (value !== null) {
                      onChange(value);
                      if (onChangeCallback) {
                        onChangeCallback(value);
                      }
                    }
                  }}
                  {...otherProps}
                />
              }
              label={label}
            />
          );
        }}
      />
    </>
  );
};

export default FormToggleSwitch;
