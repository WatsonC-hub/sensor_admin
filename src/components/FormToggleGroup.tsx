import {
  ToggleButtonGroupProps,
  ToggleButtonGroup,
  Typography,
  ToggleButton,
  Box,
} from '@mui/material';
import React from 'react';
import {Controller, FieldValues, Path, useFormContext} from 'react-hook-form';

type FormToggleGroupProps<TFieldValues extends FieldValues> = ToggleButtonGroupProps & {
  name: Path<TFieldValues>;
  warning?: (value: any) => string;
  children?: React.ReactNode;
  rules?: any;
  label: string;
  noSelectValue?: any;
  values: {
    label: string | React.ReactNode;
    value: any;
  }[];
  onChangeCallback?: (value: any) => void;
};

const FormToggleGroup = <TFieldValues extends FieldValues>({
  name,
  warning,
  rules,
  onChangeCallback,
  label,
  noSelectValue,
  values,
  ...otherProps
}: FormToggleGroupProps<TFieldValues>) => {
  const {
    control,
    formState: {errors},
  } = useFormContext<TFieldValues>();
  return (
    <>
      <Typography variant="subtitle1">{label}</Typography>
      <Controller
        control={control}
        name={name}
        // defaultvalue={get(defaultValues, name) === undefined ? '' : get(defaultValues, name)}
        rules={rules}
        render={({field: {value, onChange, ref, name}}) => {
          // console.log('value', value);
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
                } else if (noSelectValue) {
                  onChange(noSelectValue);
                  if (onChangeCallback) {
                    onChangeCallback(noSelectValue);
                  }
                }
              }}
              {...otherProps}
            >
              {values.map((val) => (
                <ToggleButton key={val.value} value={val.value} sx={{px: 2}}>
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
