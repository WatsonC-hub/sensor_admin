import {GridBaseProps, Grid2, FormControlLabel, Checkbox, CheckboxProps, Box} from '@mui/material';
import React from 'react';
import {FieldValues, useFormContext, Controller, Path} from 'react-hook-form';
import {FormContext} from './const';

type FormCheckboxProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  gridSizes?: GridBaseProps['size'];
  icon?: React.ReactNode;
} & Omit<CheckboxProps, 'name' | 'checked' | 'onChange' | 'inputRef'>;

const FormCheckbox = <T extends FieldValues>({
  name,
  label,
  gridSizes,
  icon,
  ...props
}: FormCheckboxProps<T>) => {
  const {control} = useFormContext<T>();
  const {gridSizes: contextGridSizes} = React.useContext(FormContext);
  return (
    <Grid2 size={gridSizes ?? contextGridSizes}>
      <FormControlLabel
        control={
          <Controller
            name={name}
            control={control}
            render={({field}) => (
              <Checkbox
                {...field}
                checked={!!field.value}
                onChange={(e) => {
                  field.onChange(e.target.checked);
                }}
                {...props}
              />
            )}
          />
        }
        label={
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            {icon}
            {label}
          </Box>
        }
      />
    </Grid2>
  );
};

export default FormCheckbox;
