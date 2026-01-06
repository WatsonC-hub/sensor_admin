import {Autocomplete, Chip, TextField, Typography} from '@mui/material';
import React from 'react';
import {Noop} from 'react-hook-form';
import {locationFilterOptions} from './filter_consts';

type Props = {
  value: Array<string> | undefined | null;
  setValue: (value: Array<string>) => void;
  onBlur?: Noop;
  label?: string;
};

const LocationFilter = ({value, setValue, onBlur, label}: Props) => {
  return (
    <Autocomplete
      sx={{
        marginTop: '8px',
        marginBottom: '4px',
        pb: 1.5,
      }}
      freeSolo
      forcePopupIcon={false}
      multiple
      fullWidth
      value={locationFilterOptions.filter((item) => value?.includes(item.name)) ?? []}
      autoHighlight={true}
      onChange={(event, newValue) => {
        setValue(newValue.filter((item) => typeof item != 'string').map((item) => item.name));
      }}
      id="tags-standard"
      options={locationFilterOptions}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }

        return option.name;
      }}
      isOptionEqualToValue={(option, value) => {
        return option.name === value.name;
      }}
      renderTags={(value, getTagProps) => {
        return value.map((option, index) => {
          const content = (
            <Typography display="inline" variant="body2">
              {option.name}
            </Typography>
          );

          return (
            <Chip
              variant="outlined"
              label={content}
              component={'div'}
              {...getTagProps({index})}
              key={index}
            />
          );
        });
      }}
      renderOption={(props, option) => (
        <li {...props} key={option.name}>
          <Typography display="inline" variant="body2">
            {option.name}
          </Typography>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          InputLabelProps={{shrink: true}}
          variant="outlined"
          label={label}
          placeholder="Vælg visning..."
          onBlur={onBlur}
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
        />
      )}
      filterSelectedOptions
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
    />
  );
};

export default LocationFilter;
