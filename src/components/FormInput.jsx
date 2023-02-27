import {TextField} from '@mui/material';
import {Controller, useFormContext} from 'react-hook-form';

const FormInput = ({name, ...otherProps}) => {
  const {
    control,
    formState: {errors},
  } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      defaultvalue=""
      render={({field}) => (
        <TextField
          sx={{
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: '#000000',
            },
            '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
            '& .MuiInputLabel-root.Mui-disabled': {color: 'rgba(0, 0, 0, 0.38)'}, //styles the label
            '& .MuiOutlinedInput-root': {
              '& > fieldset': {borderColor: 'primary.main'},
            },
          }}
          className="swiper-no-swiping"
          variant="outlined"
          InputLabelProps={{shrink: true}}
          fullWidth
          margin="dense"
          {...otherProps}
          {...field}
          error={!!errors[name]}
          helperText={errors[name] ? errors[name].message : ''}
        />
      )}
    />
  );
};

export default FormInput;
