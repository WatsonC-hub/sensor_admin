import {Autocomplete, Chip, TextField, Typography} from '@mui/material';
import React from 'react';

import {useNotificationTypes} from '~/hooks/query/useNotificationOverview';

import type {Noop} from 'react-hook-form';

type Props = {
  value: Array<number> | undefined | null;
  setValue: (value: Array<number>) => void;
  onBlur?: Noop;
  label?: string;
};

const NotificationTypeFilter = ({setValue, value, onBlur, label = 'Notifikationer'}: Props) => {
  const {data} = useNotificationTypes();

  const options = data || [];

  return (
    <Autocomplete
      freeSolo
      forcePopupIcon={false}
      multiple
      fullWidth
      value={options.filter((item) => value?.includes(item.gid)) ?? []}
      autoHighlight={true}
      onChange={(event, newValue) => {
        setValue(newValue.filter((item) => typeof item != 'string').map((item) => item.gid));
      }}
      id="tags-standard"
      options={options}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }

        return option.name;
        // return `${option.id.slice(0, 4)} - ${option.group_name}`;
      }}
      isOptionEqualToValue={(option, value) => {
        if (typeof option === 'string' || typeof value === 'string') {
          return false;
        }
        return option.gid === value.gid;
      }}
      renderValue={(value, getTagProps) => {
        return value.map((option, index) => {
          if (typeof option === 'string') {
            return null;
          }

          const content = (
            <Typography
              variant="body2"
              sx={{
                display: 'inline',
              }}
            >
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
        <li {...props} key={option.gid}>
          <Typography
            variant="body2"
            sx={{
              display: 'inline',
            }}
          >
            {option.name}
          </Typography>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          slotProps={{
            ...params.slotProps,
            inputLabel: {shrink: true},
          }}
          variant="outlined"
          label={label}
          placeholder="Vælg notifikations type(r)"
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

export default NotificationTypeFilter;
