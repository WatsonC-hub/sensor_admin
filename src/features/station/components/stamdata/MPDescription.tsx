import {Autocomplete, AutocompleteProps, TextField, TextFieldProps} from '@mui/material';
import React from 'react';

type Props = {
  value: string | undefined;
  onChange: (value: string) => void;
  onChangeCallback?: (value: string) => void;
  onBlur: () => void;
  ref: React.Ref<any>;
  slots?: {
    autocomplete?: AutocompleteProps<any, any, any, any>;
    textfield?: TextFieldProps;
  };
  disabled?: boolean;
};
const options = [
  {label: 'Top rør'},
  {label: 'Top WatsonC-prop'},
  {label: 'Pejlestuds'},
  {label: 'Bund af v-overløb'},
  {label: 'Overløbskant'},
  {label: 'Skal indmåles'},
];

const MPDescription = ({
  value,
  onChange,
  onBlur,
  ref,
  slots,
  onChangeCallback,
  disabled,
}: Props) => {
  return (
    <Autocomplete
      disablePortal
      freeSolo
      disableClearable
      disabled={disabled}
      slotProps={{
        listbox: {
          sx: {
            borderColor: 'primary.main',
            '& .Mui-focused': {
              borderColor: 'primary.main',
            },
          },
        },
      }}
      options={options}
      inputValue={value ?? ''}
      value={value ?? ''}
      ref={ref}
      fullWidth
      onBlur={onBlur}
      onInputChange={(e, value) => {
        onChange(value);

        if (onChangeCallback) {
          onChangeCallback(value);
        }
      }}
      onChange={(e, value) => {
        const newValue = typeof value == 'string' ? value : value.label;
        onChange(newValue);
        if (onChangeCallback) {
          onChangeCallback(newValue);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder="F.eks. Top rør"
          slotProps={{
            input: {
              ...params?.InputProps,
              sx: {
                '& .Mui-disabled': {
                  WebkitTextFillColor: '#000000',
                  color: 'rgba(0, 0, 0, 0.38)',
                },
                '& > fieldset': {
                  borderColor: 'primary.main',
                },
              },
            },
            inputLabel: {
              shrink: true,
              sx: {
                '& .Mui-disabled': {color: 'rgba(0, 0, 0, 0.38)'},
                color: 'primary.main',
                zIndex: 0,
              },
            },
            formHelperText: {
              sx: {
                position: 'absolute',
                top: 'calc(100% - 1px)',
              },
            },
          }}
          label="Beskrivelse"
          {...slots?.textfield}
        />
      )}
      {...slots?.autocomplete}
    />
  );
};

export default MPDescription;
