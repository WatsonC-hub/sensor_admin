import {GridBaseProps, Grid2, FormControlLabel, Checkbox} from '@mui/material';
import React from 'react';
import {FieldValues, useFormContext, Controller, Path} from 'react-hook-form';
import {FormContext} from './const';

type CheckboxProps<T extends FieldValues> = {
  key?: string;
  name: Path<T>;
  label: string;
  gridSizes?: GridBaseProps['size'];
};

const FormCheckbox = <T extends FieldValues>({name, label, gridSizes, key}: CheckboxProps<T>) => {
  const {control} = useFormContext<T>();
  const {gridSizes: contextGridSizes} = React.useContext(FormContext);
  return (
    <Grid2 size={gridSizes ?? contextGridSizes}>
      <FormControlLabel
        key={key}
        control={
          <Controller
            key={key}
            name={name}
            control={control}
            render={({field}) => (
              <Checkbox
                {...field}
                checked={field.value ?? false}
                onChange={(e) => {
                  field.onChange(e.target.checked);
                }}
              />
            )}
          />
        }
        label={label}
      />
    </Grid2>
  );
};

export default FormCheckbox;
