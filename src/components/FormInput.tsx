import {TextField, TextFieldProps} from '@mui/material';
import moment from 'moment';
import {Controller, FieldValues, Path, get, useFormContext} from 'react-hook-form';

type FormInputProps<TFieldValues extends FieldValues> = TextFieldProps & {
  name: Path<TFieldValues>;
  warning?: (value: any) => string | undefined;
  children?: React.ReactNode;
  rules?: any;
  transform?: (value: any) => any;
  onChangeCallback?: (value: any) => void;
  type?: string;
};

const FormInput = <TFieldValues extends FieldValues>({
  name,
  warning,
  children,
  rules,
  transform,
  onChangeCallback,
  type,
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
            name={name}
            type={type}
            value={value ?? ''}
            onBlur={onBlur}
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
            }}
            className="swiper-no-swiping"
            variant="outlined"
            InputLabelProps={{shrink: true}}
            fullWidth
            margin="dense"
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
            helperText={errorMessage || warningMessage || (otherProps?.helperText ?? '')}
          >
            {children}
          </TextField>
        );
      }}
    />
  );
};

export default FormInput;
