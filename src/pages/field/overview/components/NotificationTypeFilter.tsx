import {Autocomplete, Chip, TextField, Typography} from '@mui/material';
import React from 'react';
import {Noop} from 'react-hook-form';
import {getColor} from '~/features/notifications/utils';
import {useNotificationTypes} from '~/hooks/query/useNotificationOverview';

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
      sx={{
        marginTop: '8px',
        marginBottom: '4px',
        pb: 1.5,
      }}
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
        return option.gid === value.gid;
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
              sx={{
                backgroundColor: getColor({flag: option.flag}),
                color: 'HighlightText',
                opacity: 0.8,
              }}
              component={'div'}
              {...getTagProps({index})}
              key={index}
            />
          );
        });
      }}
      renderOption={(props, option) => (
        <li {...props} key={option.gid}>
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
          placeholder="Indtast notifikation type"
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
