import type {GridBaseProps, RadioGroupProps, GridProps} from '@mui/material';
import {Grid, FormControlLabel, Radio, RadioGroup, Box} from '@mui/material';
import React from 'react';
import type {FieldValues, Path} from 'react-hook-form';
import {useFormContext, Controller} from 'react-hook-form';
import {FormContext} from './const';

type FormRadioProps<T extends FieldValues> = {
  name: Path<T>;
  label?: React.ReactNode;
  gridSizes?: GridBaseProps['size'];
  icon?: React.ReactNode;
  gridProps?: GridProps;
  options: {value: string | number | boolean; label: string; icon?: React.ReactNode}[];
} & Omit<RadioGroupProps, 'name' | 'value' | 'onChange'>;

const FormRadio = <T extends FieldValues>({
  name,
  label,
  gridSizes,
  gridProps,
  options,
  ...props
}: FormRadioProps<T>) => {
  const {control} = useFormContext<T>();
  const {gridSizes: contextGridSizes} = React.useContext(FormContext);

  return (
    <Grid {...gridProps} size={gridSizes ?? contextGridSizes}>
      {label && <Box sx={{display: 'flex', alignItems: 'center'}}>{label}</Box>}
      <Controller
        name={name}
        control={control}
        render={({field}) => (
          <RadioGroup
            {...field}
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value)}
            {...props}
          >
            {options.map((opt) => (
              <FormControlLabel
                key={opt.label}
                value={opt.value}
                control={<Radio />}
                label={<Box sx={{display: 'flex', alignItems: 'center'}}>{opt.label}</Box>}
              />
            ))}
          </RadioGroup>
        )}
      />
    </Grid>
  );
};

export default FormRadio;
