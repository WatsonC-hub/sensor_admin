import {
  GridBaseProps,
  Grid,
  FormControlLabel,
  Checkbox,
  CheckboxProps,
  Box,
  GridProps,
  FormHelperText,
} from '@mui/material';
import React from 'react';
import {FieldValues, useFormContext, Controller, Path} from 'react-hook-form';
import {FormContext} from './const';

type FormCheckboxProps<T extends FieldValues> = {
  name: Path<T>;
  label?: string;
  gridSizes?: GridBaseProps['size'];
  icon?: React.ReactNode;
  gridProps?: GridProps;
  onChangeCallback?: (value: boolean) => void;
  warning?: (value: boolean) => string | undefined;
} & Omit<CheckboxProps, 'name' | 'checked' | 'onChange' | 'inputRef'>;

const FormCheckbox = <T extends FieldValues>({
  name,
  label,
  gridSizes,
  icon,
  gridProps,
  onChangeCallback,
  warning,
  disabled,
  ...props
}: FormCheckboxProps<T>) => {
  const {control, watch} = useFormContext<T>();
  const {gridSizes: contextGridSizes} = React.useContext(FormContext);
  const watchValue = watch(name);
  return (
    <Grid {...gridProps} size={gridSizes ?? contextGridSizes}>
      <Controller
        name={name}
        control={control}
        render={({field: {value, onChange}}) => {
          return (
            <FormControlLabel
              disabled={disabled}
              control={
                <Checkbox
                  checked={!!value}
                  sx={{
                    width: 'fit-content',
                  }}
                  onChange={(e) => {
                    onChange(e.target.checked);
                    if (onChangeCallback) onChangeCallback(e.target.checked);
                  }}
                  {...props}
                />
              }
              label={
                <Box sx={{display: 'flex', alignItems: 'center', width: 'fit-content'}}>
                  {icon}
                  {label}
                </Box>
              }
            />
          );
        }}
      />

      {warning && <FormHelperText sx={{color: 'orange'}}>{warning(watchValue)}</FormHelperText>}
    </Grid>
  );
};

export default FormCheckbox;
