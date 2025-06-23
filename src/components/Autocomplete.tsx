import {
  Autocomplete,
  AutocompleteProps,
  Box,
  InputAdornment,
  TextField,
  TextFieldProps,
} from '@mui/material';
import {merge} from 'lodash';
import React from 'react';
import LinkableTooltip from './LinkableTooltip';

export type AutoCompleteFieldProps<T> = Omit<
  AutocompleteProps<T, false, false, false>,
  'renderInput'
> & {
  selectValue: T | null;
  onChange: (value: T | null) => void;
  labelKey: keyof T;
  options: T[];
  error?: string | undefined;
  textFieldsProps: Partial<TextFieldProps>;
  fieldDescriptionText?: string;
};

const ExtendedAutocomplete = <T extends object>({
  selectValue,
  onChange,
  options,
  labelKey,
  error,
  textFieldsProps,
  fieldDescriptionText,
  ...autocompleteProps
}: AutoCompleteFieldProps<T>): React.ReactElement => {
  return (
    <Autocomplete<T>
      id="demo"
      value={selectValue}
      options={options}
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
      fullWidth
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      isOptionEqualToValue={(option, value) => option[labelKey] === value[labelKey]}
      getOptionLabel={(option) => (option[labelKey] ? `${option[labelKey]}` : '')}
      renderInput={(params) => {
        let sx = {
          pb: 0,
          '& .MuiInputBase-input.Mui-disabled': {
            WebkitTextFillColor: '#000000',
          },
          '& .MuiInputLabel-root': {
            color: 'primary.main',
          }, //styles the label
          '& .MuiInputLabel-root.Mui-disabled': {color: 'rgba(0, 0, 0, 0.38)'}, //styles the label
          '& .MuiOutlinedInput-root': {
            '& > fieldset': {borderColor: 'primary.main'},
          },
          '.MuiFormHelperText-root': {
            position: 'absolute',
            top: '90%',
          },
        };

        if (textFieldsProps.sx) {
          sx = merge(sx, textFieldsProps.sx);
        }
        return (
          <TextField
            {...textFieldsProps}
            {...params}
            fullWidth
            margin="dense"
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            variant="outlined"
            error={Boolean(error)}
            helperText={Boolean(error) && error}
            sx={sx}
          />
        );
      }}
      renderInput={(params) => {
        const {InputProps} = params;
        return (
          <TextField
            {...params}
            {...textFieldsProps}
            fullWidth
            margin="dense"
            InputLabelProps={{shrink: true}}
            slotProps={{
              inputLabel: {shrink: true},
              input: {
                endAdornment: (
                  <>
                    {InputProps.endAdornment}
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                      <InputAdornment position="end">
                        {fieldDescriptionText && (
                          <LinkableTooltip fieldDescriptionText={fieldDescriptionText} />
                        )}
                      </InputAdornment>
                    </Box>
                  </>
                ),
              },
            }}
            variant="outlined"
            error={Boolean(error)}
            helperText={Boolean(error) && error}
            sx={{
              pb: 0,
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#000000',
              },
              '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
              '& .MuiInputLabel-root.Mui-disabled': {color: 'rgba(0, 0, 0, 0.38)'}, //styles the label
              '& .MuiOutlinedInput-root': {
                '& > fieldset': {borderColor: 'primary.main'},
              },
              '.MuiFormHelperText-root': {
                position: 'absolute',
                top: '90%',
              },
            }}
          />
        );
      }}
      {...autocompleteProps}
    />
  );
};

export default ExtendedAutocomplete;
