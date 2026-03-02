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
} from '@mui/material';
import {merge} from 'lodash';
import React from 'react';
import {Controller, FieldValues, Path, useFormContext} from 'react-hook-form';

type FormToggleButtonProps<T extends FieldValues> = {
  name: Path<T>;
  options: Record<string, string>;
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
  options,
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
                  sx={sx}
                  {...rest}
                >
                  {Object.entries(options).map(([key, value]) => {
                    return (
                      <ToggleButton key={key} value={key} size="small">
                        <Typography textTransform={'initial'}>{value}</Typography>
                      </ToggleButton>
                    );
                  })}
                </ToggleButtonGroup>
              </Stack>
            );
          }}
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
