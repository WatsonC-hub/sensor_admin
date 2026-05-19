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
import {merge} from 'lodash';
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
      flexDirection={gridDirection}
      {...gridProps}
      size={gridSizes}
      spacing={1}
      alignItems="center"
    >
      <Grid2>
        <Controller
          name={name}
          control={control}
          render={({field: {value, onChange}}) => {
            const internal_sx: SxProps = {
              gap: 1,
              '& .MuiToggleButton-root': {
                borderColor: 'primary.main',
                borderRadius: 999,
              },
            };
            const sx = merge({}, rest.sx, internal_sx);
            return (
              <Stack direction={direction} spacing={1}>
                {label && <Typography>{label}</Typography>}
                <ToggleButtonGroup
                  {...rest}
                  sx={sx}
                  value={value}
                  exclusive
                  // color="primary"
                  onChange={(event, newValue) => {
                    console.log('Selected value:', newValue);
                    if (newValue === null) {
                      return;
                    }

                    onChange(newValue);
                    if (onChangeCallback) onChangeCallback(newValue);
                  }}
                >
                  {options.map((option) => {
                    const sx = toggleButtonProps?.sx || {};

                    const merged_sx = merge({}, sx, {
                      '&:hover': {
                        color: 'white',
                        backgroundColor: 'primary.light',
                        '&.Mui-selected': {
                          backgroundColor: 'primary.dark',
                          color: 'primary.contrastText',
                        },
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                      },
                    });

                    return (
                      <ToggleButton
                        {...toggleButtonProps}
                        key={option.label}
                        color="primary"
                        // selected={isEqual(option.value, value)}
                        sx={merged_sx}
                        value={option.value}
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
