import {ToggleButtonGroupProps, ToggleButtonGroup, Typography, ToggleButton} from '@mui/material';
import React from 'react';
import {Controller, FieldValues, Path, useFormContext} from 'react-hook-form';

type FormToggleGroupProps<TFieldValues extends FieldValues> = ToggleButtonGroupProps & {
  name: Path<TFieldValues>;
  warning?: (value: any) => string;
  children?: React.ReactNode;
  rules?: any;
  label: string;
  values: {
    label: string | React.ReactNode;
    value: any;
  }[];
  onChangeCallback?: (value: any) => void;
};

const FormToggleGroup = <TFieldValues extends FieldValues>({
  name,
  rules,
  onChangeCallback,
  label,
  values,
  ...otherProps
}: FormToggleGroupProps<TFieldValues>) => {
  const {control} = useFormContext<TFieldValues>();
  return (
    <>
      <Typography variant="subtitle1">{label}</Typography>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({field: {value, onChange, ref, name}}) => {
          return (
            <ToggleButtonGroup
              ref={ref}
              value={value}
              exclusive
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
            >
              {values.map((val) => (
                <ToggleButton key={val.value} value={val.value}>
                  {val.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          );
        }}
      />
    </>
  );
};

export default FormToggleGroup;
