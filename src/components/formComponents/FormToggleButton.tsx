import {
  Box,
  FormHelperText,
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {isEqual, merge} from 'lodash';
import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';

import type {
  GridBaseProps,
  GridProps,
  SxProps,
  ToggleButtonGroupProps,
  ToggleButtonProps,
} from '@mui/material';
import type {FieldPath, FieldPathValue, FieldValues} from 'react-hook-form';

type FormToggleButtonOption<T> = {
  value: T;
  label: string;
};

export type FormToggleButtonProps<T extends FieldValues, K extends FieldPath<T>> = {
  name: K;
  options: FormToggleButtonOption<FieldPathValue<T, K>>[];
  label?: string;
  /** Wrap in a Grid item (default). Set to false to render inline, e.g. inside a flex row */
  useGrid?: boolean;
  gridSizes?: GridBaseProps['size'];
  gridProps?: GridProps;
  direction?: 'row' | 'column';
  gridDirection?: 'row' | 'column';
  onChangeCallback?: (value: FieldPathValue<T, K>) => void;
  warning?: (value: FieldPathValue<T, K>) => string | undefined;
  toggleButtonProps?: Omit<ToggleButtonProps, 'value' | 'key'>;
} & Omit<ToggleButtonGroupProps, 'name' | 'value' | 'onChange'>;

const FormToggleButton = <T extends FieldValues, K extends FieldPath<T>>({
  name,
  label,
  useGrid = true,
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
  // Inline, messages wrap to the buttons' width so they never widen the surrounding row
  const messageSx = useGrid ? {} : {width: 0, minWidth: '100%'};

  const field = (
    <Controller
      name={name}
      control={control}
      render={({field: {value, onChange}, fieldState: {error}}) => {
        const internal_sx: SxProps = {
          gap: 0.5,
          // MUI joins grouped buttons by giving all but the first a transparent left border
          // and -1px margin. The pills are spaced apart, so give each its own full border.
          '& .MuiToggleButtonGroup-grouped': {
            ml: 0,
            border: '1px solid',
            borderColor: 'primary.main',
            borderRadius: 999,
            '&.Mui-disabled': {
              borderColor: 'action.disabledBackground',
            },
          },
        };
        const sx = merge({}, rest.sx, internal_sx);
        const warningText = warning?.(value);
        return (
          <Stack direction={direction} spacing={1}>
            {label && <Typography>{label}</Typography>}
            <Box sx={{display: 'inline-flex', flexDirection: 'column'}}>
              <ToggleButtonGroup
                {...rest}
                sx={sx}
                value={value}
                exclusive
                onChange={(event, newValue) => {
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
                      selected={isEqual(option.value, value)}
                      sx={merged_sx}
                      value={option.value}
                    >
                      <Typography
                        sx={{
                          textTransform: 'initial',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {option.label}
                      </Typography>
                    </ToggleButton>
                  );
                })}
              </ToggleButtonGroup>
              {error?.message && (
                <FormHelperText error sx={messageSx}>
                  {error.message}
                </FormHelperText>
              )}
              {warningText && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'error.main',
                    mt: 0.5,
                    ...messageSx,
                  }}
                >
                  {warningText}
                </Typography>
              )}
            </Box>
          </Stack>
        );
      }}
    />
  );

  if (!useGrid) return field;

  return (
    <Grid
      container
      {...gridProps}
      size={gridSizes}
      spacing={1}
      sx={[
        {
          flexDirection: gridDirection,
          alignItems: 'center',
        },
        ...(gridProps ? (Array.isArray(gridProps.sx) ? gridProps.sx : [gridProps.sx]) : []),
      ]}
    >
      <Grid>{field}</Grid>
    </Grid>
  );
};

export default FormToggleButton;
