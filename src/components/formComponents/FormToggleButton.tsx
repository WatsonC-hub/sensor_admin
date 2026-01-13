import {
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Grid2Props,
  GridBaseProps,
  Grid2,
  ToggleButtonGroupProps,
} from '@mui/material';
import React from 'react';
import {Controller, FieldValues, Path, useFormContext} from 'react-hook-form';

type FormToggleButtonProps<T extends FieldValues> = {
  name: Path<T>;
  label?: string;
  gridSizes?: GridBaseProps['size'];
  gridProps?: Grid2Props;
  direction?: 'row' | 'column';
  gridDirection?: 'row' | 'column';
  onChangeCallback?: (value: string) => void;
  warning?: (value: boolean) => string | undefined;
} & Omit<ToggleButtonGroupProps, 'name' | 'value' | 'onChange'>;

const FormToggleButton = <T extends FieldValues>({
  name,
  label,
  gridSizes,
  gridProps,
  onChangeCallback,
  direction,
  gridDirection,
  warning,
  ...rest
}: FormToggleButtonProps<T>) => {
  const {control} = useFormContext<T>();

  return (
    <Grid2
      container
      {...gridProps}
      flexDirection={gridDirection}
      size={gridSizes}
      spacing={1}
      alignItems="center"
    >
      <Grid2 alignContent={'center'}>{label && <Typography>{label}</Typography>}</Grid2>
      <Grid2 size={9}>
        <Controller
          name={name}
          control={control}
          render={({field: {value, onChange}}) => (
            <Stack direction={direction} spacing={4}>
              <ToggleButtonGroup
                value={value}
                exclusive
                color="primary"
                onChange={(event, newValue) => {
                  if (newValue === null) return;
                  onChange(newValue);
                  if (onChangeCallback) onChangeCallback(newValue);
                }}
                {...rest}
              >
                <ToggleButton value="kunde" size="small">
                  <Typography textTransform={'initial'}>Kunde</Typography>
                </ToggleButton>
                <ToggleButton value="watsonc" size="small">
                  <Typography textTransform={'initial'}>WatsonC</Typography>
                </ToggleButton>
                <ToggleButton value="begge" size="small">
                  <Typography textTransform={'initial'}>Begge</Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          )}
        />
        {warning && (
          <Typography color="warning.main" variant="caption" sx={{mt: 0.5}}>
            {warning(control._formValues[name])}
          </Typography>
        )}
      </Grid2>
    </Grid2>
  );
};

export default FormToggleButton;
