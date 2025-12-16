import {
  Autocomplete,
  AutocompleteProps,
  Box,
  InputAdornment,
  TextField,
  TextFieldProps,
} from '@mui/material';
import React from 'react';
import LinkableTooltip from './LinkableTooltip';
import {merge} from 'lodash';

// notice we add M extends boolean to control multiple
export type AutoCompleteFieldProps<T extends object, M extends boolean = false> = Omit<
  AutocompleteProps<T, M, boolean, false>,
  'renderInput' | 'onChange'
> & {
  selectValue: M extends true ? T[] : T | null;
  onChange: (value: M extends true ? T[] : T | null) => void;
  labelKey: keyof T;
  options: T[];
  error?: string | undefined;
  textFieldsProps: Partial<TextFieldProps>;
  fieldDescriptionText?: string;
};

const ExtendedAutocomplete = <T extends object, M extends boolean = false>({
  selectValue,
  onChange,
  options,
  labelKey,
  error,
  textFieldsProps,
  fieldDescriptionText,
  onInputChange,
  inputValue,
  ...autocompleteProps
}: AutoCompleteFieldProps<T, M>): React.ReactElement => {
  return (
    <Autocomplete<T, M, boolean, false>
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
      isOptionEqualToValue={(option, value) => {
        return option[labelKey] === value[labelKey];
      }}
      getOptionLabel={(option) => {
        return option[labelKey] ? `${option[labelKey]}` : '';
      }}
      filterSelectedOptions={true}
      inputValue={inputValue}
      onInputChange={(event, newInputValue, reason) => {
        if (onInputChange && (reason === 'input' || reason === 'selectOption')) {
          onInputChange(event, newInputValue, reason);
        }
        if (onInputChange && reason === 'clear') {
          onChange(null as M extends true ? T[] : T | null);
          onInputChange(event, '', reason);
        }

        if (onInputChange && reason === 'reset' && inputValue === '') {
          onInputChange(event, newInputValue, reason);
        }

        if (onInputChange && reason === 'blur') onInputChange(event, newInputValue, reason);
      }}
      renderInput={(params) => {
        const {InputProps} = params;
        let sx = {
          pb: 0,
          '& .MuiInputBase-input.Mui-disabled': {
            WebkitTextFillColor: '#000000',
          },
          '& .MuiInputLabel-root': {
            color: 'primary.main',
          },
          '& .MuiInputLabel-root.Mui-disabled': {
            color: 'rgba(0, 0, 0, 0.38)',
          },
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
            {...params}
            {...textFieldsProps}
            fullWidth
            margin="dense"
            slotProps={{
              inputLabel: {shrink: true},
              input: {
                ...InputProps,
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
            sx={sx}
          />
        );
      }}
      {...autocompleteProps}
    />
  );
};

export default ExtendedAutocomplete;
