import {MuiTelInput, type MuiTelInputProps} from 'mui-tel-input';

export type PhoneInputProps = Omit<MuiTelInputProps, 'forceCallingCode' | 'defaultCountry'> & {
  error?: boolean;
  helperText?: string;
};

const PhoneInput = ({slotProps, error, helperText, ...rest}: PhoneInputProps) => {
  return (
    <MuiTelInput
      {...rest}
      langOfCountryName="da"
      forceCallingCode={true}
      defaultCountry={'DK'}
      sx={{
        pb: 1,
        '& .MuiFormHelperText-root': {
          color: error ? 'red' : helperText ? 'orange' : undefined,
          position: 'absolute',
          top: 'calc(100% - 8px)',
        },
      }}
      MenuProps={{
        TransitionProps: {
          timeout: 0,
        },
      }}
      margin="dense"
      slotProps={{
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
          },
          ...slotProps?.input,
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
      error={error}
      helperText={helperText}
      fullWidth
      variant="outlined"
    />
  );
};

export default PhoneInput;
