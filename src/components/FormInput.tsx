import {TextField, BaseTextFieldProps} from '@mui/material';
import moment from 'moment';
import {ChangeEvent} from 'react';
import {Controller, get, useFormContext} from 'react-hook-form';

interface FormInputProps extends BaseTextFieldProps {
  name: string;
  warning?: (value: string) => boolean;
  children?: React.ReactNode;
  rules?: any;
  transform?: any;
  onChangeCallback?: any;
  type?: string;
}

const FormInput = ({
  name,
  warning,
  children,
  rules,
  transform,
  type,
  onChangeCallback,
  ...props
}: FormInputProps) => {
  const {
    control,
    formState: {errors},
    getValues,
  } = useFormContext();

  if (!transform) {
    transform = (e: React.FormEvent<ChangeEvent>) => e;
  }

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={get(getValues, name) === undefined ? '' : get(getValues, name)}
      rules={rules}
      render={({field: {value, onChange, onBlur, ref, name}}) => {
        if (type === 'datetime-local' && value) {
          value = moment(value).format('YYYY-MM-DDTHH:mm');
        }

        return (
          <TextField
            {...props}
            name={name}
            value={value ?? ''}
            onBlur={onBlur}
            ref={ref}
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#000000',
              },
              '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
              '& .MuiInputLabel-root.Mui-disabled': {color: 'rgba(0, 0, 0, 0.38)'}, //styles the label
              '& .MuiOutlinedInput-root': {
                '& > fieldset': {borderColor: 'primary.main'},
              },
              '.MuiFormHelperText-root': {color: warning && warning(value) ? 'orange' : 'red'},
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
              } else {
                onChange(transform(e));
                onChangeCallback && onChangeCallback(e);
              }
            }}
            error={!!get(errors, name)}
            helperText={
              get(errors, name) ? get(errors, name).message : '' || (warning && warning(value))
            }
          >
            {children}
          </TextField>
        );
      }}
    />
  );
};

export default FormInput;
