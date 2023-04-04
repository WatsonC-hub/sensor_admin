import {TextField} from '@mui/material';
import {Controller, useFormContext, get} from 'react-hook-form';

const FormInput = ({name, warning, children, ...otherProps}) => {
  const {
    control,
    formState: {errors},
    defaultValues,
  } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      defaultvalue={get(defaultValues, name)}
      render={({field, formState, fieldState}) => (
        <TextField
          {...otherProps}
          {...field}
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
            '.MuiFormHelperText-root': {color: warning && warning(field.value) ? 'orange' : 'red'},
          }}
          className="swiper-no-swiping"
          variant="outlined"
          InputLabelProps={{shrink: true}}
          fullWidth
          margin="dense"
          onChange={(e) => {
            if (otherProps.type === 'number' && e.target.value !== '') {
              field.onChange(Number(e.target.value));
            } else {
              field.onChange(e);
            }
          }}
          error={!!get(errors, name)}
          helperText={
            get(errors, name) ? get(errors, name).message : '' || (warning && warning(field.value))
          }
        >
          {children}
        </TextField>
      )}
    />
  );
};

export default FormInput;
