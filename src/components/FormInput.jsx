import {TextField} from '@mui/material';
import {Controller, useFormContext, get} from 'react-hook-form';
import moment from 'moment';

const FormInput = ({name, warning, children, rules, transform, ...otherProps}) => {
  const {
    control,
    formState: {errors},
    defaultValues,
  } = useFormContext();

  if (!transform) {
    transform = (e) => e;
  }

  return (
    <Controller
      control={control}
      name={name}
      defaultvalue={get(defaultValues, name)}
      rules={rules}
      render={({field: {value, onChange, onBlur, ref, name}, formState, fieldState}) => {
        if (otherProps.type === 'datetime-local' && value) {
          value = moment(value).format('YYYY-MM-DDTHH:mm');
        }

        return (
          <TextField
            {...otherProps}
            name={name}
            value={value}
            onBlur={onBlur}
            ref={ref}
            defaultValue={''}
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
              if (otherProps.type === 'number' && e.target.value !== '') {
                onChange(transform(Number(e.target.value)));
              } else {
                onChange(transform(e));
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
