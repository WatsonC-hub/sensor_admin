import {Box, MenuItem, TextField, TextFieldProps} from '@mui/material';
import moment from 'moment';
import {ChangeEvent, FocusEvent} from 'react';
import {Controller, FieldValues, Path, get, useFormContext} from 'react-hook-form';
import TooltipWrapper from './TooltipWrapper';
export type FormInputProps<TFieldValues extends FieldValues> = TextFieldProps & {
  name: Path<TFieldValues>;
  warning?: (value: any) => string | undefined;
  children?: React.ReactNode;
  rules?: any;
  transform?: (value: any) => any;
  onChangeCallback?: (value: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | number) => void;
  onBlurCallback?: (value: FocusEvent<HTMLInputElement | HTMLTextAreaElement> | number) => void;
  type?: string;
  infoText?: string;
  options?: Array<Record<string | number, string | number>>;
  keyType?: 'string' | 'number';
};

const FormInput = <TFieldValues extends FieldValues>({
  name,
  warning,
  rules,
  transform,
  onChangeCallback,
  onBlurCallback,
  type,
  margin = 'dense',
  variant = 'outlined',
  sx,
  className,
  slotProps,
  onKeyDown,
  helperText,
  infoText,
  fullWidth = true,
  options,
  keyType = 'string',
  ...otherProps
}: FormInputProps<TFieldValues>) => {
  const {
    control,
    formState: {errors},
  } = useFormContext<TFieldValues>();

  if (!transform) {
    transform = (e) => e;
  }

  const Wrapper = infoText ? TooltipWrapper : Box;

  return (
    <Controller
      control={control}
      name={name}
      key={name}
      rules={rules}
      render={({field: {value, onChange, onBlur, ref, name}}) => {
        if (type === 'datetime-local' && value) {
          value = moment(value).format('YYYY-MM-DDTHH:mm') as any;
        }

        if (type === 'time' && value) {
          value = moment(value, 'HH:mm').format('HH:mm') as any;
        }

        const errorMessage = !!get(errors, name) && get(errors, name).message;
        const warningMessage = warning && warning(value);

        return (
          <Wrapper description={infoText} width={'100%'} sx={{position: 'relative'}}>
            <TextField
              {...otherProps}
              key={name}
              name={name}
              type={type}
              value={value ?? ''}
              onBlur={(e) => {
                onBlur();
                if (onBlurCallback) onBlurCallback(e);
              }}
              ref={ref}
              sx={{
                pb: 1,
                ...sx,
              }}
              className={className ?? ''}
              variant={variant}
              fullWidth={fullWidth}
              margin={margin}
              onKeyDown={(e) => {
                if (type === 'number' && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                  e.preventDefault();
                }
                if (onKeyDown) onKeyDown(e);
              }}
              slotProps={{
                select: {
                  displayEmpty: true,
                  ...slotProps?.select,
                  renderValue: (selected) => {
                    if (
                      selected === '' ||
                      selected === null ||
                      selected === undefined ||
                      selected === -1
                    ) {
                      return otherProps.placeholder ?? 'Vælg...';
                    }
                    if (selected === 'false' && name === 'block_on_location') return 'tidsserie';
                    if (selected === 'true' && name === 'block_on_location') return 'lokation';

                    const option = options?.find((option) => {
                      const key = Object.keys(option)[0];
                      return key == selected;
                    });
                    return option?.[selected as string | number];
                  },
                },
                htmlInput: {
                  ...slotProps?.htmlInput,
                  sx: {
                    borderColor: 'primary.main',
                    '& .Mui-focused': {
                      borderColor: 'primary.main',
                    },
                  },
                },
                input: {
                  sx: {
                    '& .Mui-disabled': {
                      WebkitTextFillColor: '#000000',
                      color: 'rgba(0, 0, 0, 0.38)',
                    },

                    '& > fieldset': {
                      borderColor: 'primary.main',
                    },
                    ...(type === 'number'
                      ? {
                          '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                            {
                              display: 'none',
                            },
                          '& input[type=number]': {
                            MozAppearance: 'textfield',
                          },
                        }
                      : {}),
                  },
                  ...slotProps?.input,
                },
                formHelperText: {
                  sx: {
                    color: errorMessage ? 'red' : warningMessage ? 'orange' : undefined,
                    position: 'absolute',
                    top: 'calc(100% - 8px)',
                  },
                  ...slotProps?.formHelperText,
                },
                inputLabel: {
                  shrink: true,

                  sx: {
                    '& .Mui-disabled': {color: 'rgba(0, 0, 0, 0.38)'},
                    color: 'primary.main',
                    zIndex: 0,
                  },
                  ...slotProps?.inputLabel,
                },
              }}
              onChange={(e) => {
                if (type === 'number' && e.target.value !== '') {
                  onChange(transform(Number(e.target.value)));
                  if (onChangeCallback) onChangeCallback(Number(e.target.value));
                } else if (type === 'number' && e.target.value === '') {
                  onChange(null);
                } else {
                  onChange(transform(e));
                  if (onChangeCallback) onChangeCallback(e);
                }
              }}
              error={!!errorMessage}
              helperText={errorMessage || warningMessage || (helperText ?? '')}
            >
              {options !== undefined && options !== null && options.length > 0 ? (
                options?.map((option) => {
                  const key =
                    keyType === 'number' ? Number(Object.keys(option)[0]) : Object.keys(option)[0];
                  const value = option[key];
                  return (
                    <MenuItem key={key} value={key}>
                      {value as string}
                    </MenuItem>
                  );
                })
              ) : (
                <div></div>
              )}
            </TextField>
          </Wrapper>
        );
      }}
    />
  );
};

export default FormInput;
