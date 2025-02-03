import {TextField, TextFieldProps} from '@mui/material';
import moment from 'moment';
import {ChangeEvent, FocusEvent} from 'react';
import {Controller, FieldValues, Path, get, useFormContext} from 'react-hook-form';

type FormInputProps<TFieldValues extends FieldValues> = TextFieldProps & {
  name: Path<TFieldValues>;
  warning?: (value: any) => string | undefined;
  children?: React.ReactNode;
  rules?: any;
  transform?: (value: any) => any;
  onChangeCallback?: (value: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | number) => void;
  onBlurCallback?: (value: FocusEvent<HTMLInputElement | HTMLTextAreaElement> | number) => void;
  type?: string;
};

const FormInput = <TFieldValues extends FieldValues>({
  name,
  warning,
  children,
  rules,
  transform,
  onChangeCallback,
  onBlurCallback,
  type,
  margin = 'dense',
  variant = 'outlined',
  sx,
  className,
  InputLabelProps,
  InputProps,
  onKeyDown,
  helperText,
  ...otherProps
}: FormInputProps<TFieldValues>) => {
  const {
    control,
    formState: {errors},
  } = useFormContext<TFieldValues>();

  if (!transform) {
    transform = (e) => e;
  }

  return (
    <Controller
      control={control}
      name={name}
      key={name}
      // defaultvalue={get(defaultValues, name) === undefined ? '' : get(defaultValues, name)}
      rules={rules}
      render={({field: {value, onChange, onBlur, ref, name}}) => {
        if (type === 'datetime-local' && value) {
          value = moment(value).format('YYYY-MM-DDTHH:mm') as any;
        }

        const errorMessage = !!get(errors, name) && get(errors, name).message;
        const warningMessage = warning && warning(value);

        return (
          <TextField
            {...otherProps}
            key={name}
            name={name}
            type={type}
            value={value ?? ''}
            onBlur={(e) => {
              onBlur();
              onBlurCallback && onBlurCallback(e);
            }}
            ref={ref}
            sx={{
              // pt: 1,
              // pt: 2,
              pb: 1,
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#000000',
              },
              '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
              '& .MuiInputLabel-root.Mui-disabled': {color: 'rgba(0, 0, 0, 0.38)'}, //styles the label
              '& .MuiOutlinedInput-root': {
                '& > fieldset': {borderColor: 'primary.main'},
              },
              '.MuiFormHelperText-root': {
                color: errorMessage ? 'red' : warningMessage ? 'orange' : undefined,
                position: 'absolute',
                top: 'calc(100% - 8px)',
              },
              ...sx,
            }}
            className={'swiper-no-swiping' + (className ? ' ' + className : '')}
            variant={variant}
            InputLabelProps={{shrink: true, style: {zIndex: 0}, ...InputLabelProps}}
            fullWidth
            margin={margin}
            onKeyDown={(e) => {
              if (type === 'number' && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                e.preventDefault();
              }
              onKeyDown && onKeyDown(e);
            }}
            InputProps={
              type === 'number'
                ? {
                    sx: {
                      '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                        display: 'none',
                      },
                      '& input[type=number]': {
                        MozAppearance: 'textfield',
                      },
                    },
                    ...InputProps,
                  }
                : InputProps
            }
            onChange={(e) => {
              if (type === 'number' && e.target.value !== '') {
                onChange(transform(Number(e.target.value)));
                onChangeCallback && onChangeCallback(Number(e.target.value));
              } else if (type === 'number' && e.target.value === '') {
                onChange(null);
              } else {
                onChange(transform(e));
                onChangeCallback && onChangeCallback(e);
              }
            }}
            error={!!errorMessage}
            helperText={errorMessage || warningMessage || (helperText ?? '')}
          >
            {children}
          </TextField>
        );
      }}
    />
  );
};

export default FormInput;
