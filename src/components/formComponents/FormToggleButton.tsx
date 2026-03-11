import {
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Grid2Props,
  GridBaseProps,
  Grid2,
  ToggleButtonGroupProps,
  SxProps,
  ToggleButtonProps,
} from '@mui/material';
import {isEqual, merge} from 'lodash';
import React from 'react';
import {Controller, FieldPath, FieldPathValue, FieldValues, useFormContext} from 'react-hook-form';

type FormToggleButtonOption<T> = {
  value: T;
  label: string;
};

type FormToggleButtonProps<T extends FieldValues, K extends FieldPath<T>> = {
  name: K;
  options: FormToggleButtonOption<FieldPathValue<T, K>>[];
  label?: string;
  gridSizes?: GridBaseProps['size'];
  gridProps?: Grid2Props;
  direction?: 'row' | 'column';
  gridDirection?: 'row' | 'column';
  onChangeCallback?: (value: FieldPathValue<T, K>) => void;
  warning?: (value: FieldPathValue<T, K>) => string | undefined;
  toggleButtonProps?: Omit<ToggleButtonProps, 'value' | 'key'>;
} & Omit<ToggleButtonGroupProps, 'name' | 'value' | 'onChange'>;

const FormToggleButton = <T extends FieldValues, K extends FieldPath<T>>({
  name,
  label,
  gridSizes,
  gridProps,
  onChangeCallback,
  direction,
  gridDirection,
  warning,
  options,
  toggleButtonProps,
  ...rest
}: FormToggleButtonProps<T, K>) => {
  const {control} = useFormContext<T, K>();

  return (
    <Grid2
      container
      {...gridProps}
      flexDirection={gridDirection}
      size={gridSizes}
      spacing={1}
      alignItems="center"
    >
      <Grid2 size={12}>
        <Controller
          name={name}
          control={control}
          render={({field: {value, onChange}}) => {
            const internal_sx: SxProps = {
              borderColor: 'primary.main',
              '& .MuiToggleButton-root': {
                borderColor: 'primary.main',
              },
              '& .MuiToggleButtonGroup-firstButton': {
                borderRightColor: 'grey.700',
              },
              '& .MuiToggleButtonGroup-lastButton': {
                borderLeftColor: 'grey.700',
              },
              '& .MuiToggleButtonGroup-middleButton': {
                borderLeftColor: 'grey.700',
                borderRightColor: 'grey.700',
              },
            };
            const sx = merge({}, rest.sx, internal_sx);
            return (
              <Stack direction={direction} spacing={1} alignItems={'center'}>
                {label && <Typography>{label}</Typography>}
                <ToggleButtonGroup
                  value={value}
                  exclusive
                  color="primary"
                  onChange={(event, newValue) => {
                    onChange(newValue);
                    if (onChangeCallback) onChangeCallback(newValue);
                  }}
                  sx={sx}
                  {...rest}
                >
                  {options.map((option) => {
                    return (
                      <ToggleButton
                        key={option.label}
                        selected={isEqual(option.value, value)}
                        value={option.value}
                        {...toggleButtonProps}
                      >
                        <Typography textTransform={'initial'}>{option.label}</Typography>
                      </ToggleButton>
                    );
                  })}
                </ToggleButtonGroup>
              </Stack>
            );
          }}
        />
        {warning && (
          <Typography color="error.main" variant="caption" sx={{mt: 0.5}}>
            {warning(control._formValues[name])}
          </Typography>
        )}
      </Grid2>
    </Grid2>
  );
};

export default FormToggleButton;
