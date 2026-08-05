import {Autocomplete, Chip, TextField, Typography} from '@mui/material';
import React from 'react';

import useLocationProject from '~/features/stamdata/api/useLocationProject';

import type {Noop} from 'react-hook-form';
import type {Project} from '~/features/stamdata/api/useLocationProject';

type Props = {
  value: Array<Project> | undefined | null;
  setValue: (value: Array<Project>) => void;
  onBlur?: Noop;
  label?: string;
};

const ProjectsFilter = ({setValue, value, onBlur, label = 'Projekter'}: Props) => {
  const {
    get: {data: options},
  } = useLocationProject();

  return (
    <Autocomplete
      sx={{
        marginTop: '8px',
        marginBottom: '4px',
      }}
      freeSolo
      forcePopupIcon={false}
      multiple
      fullWidth
      value={value ?? []}
      autoHighlight={true}
      onChange={(event, newValue) => {
        setValue(
          newValue.map((item) => {
            if (typeof item === 'string') {
              return {customer_name: item, project_no: '', project_info: ''};
            }
            return item;
          })
        );
      }}
      id="tags-standard"
      options={options || []}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }

        return `${option.customer_name ? option.customer_name + ' - ' : ''}${
          option.project_no ? `(${option.project_no})` : ''
        }${option.project_info ? ` - ${option.project_info}` : ''}`;
      }}
      isOptionEqualToValue={(option, value) => {
        if (typeof option === 'string' || typeof value === 'string') {
          return option === value;
        }
        return option.project_no === value.project_no;
      }}
      renderValue={(value, getItemProps) => {
        return value.map((option, index) => {
          if (typeof option === 'string') {
            const content = (
              <Typography
                variant="body2"
                sx={{
                  display: 'inline',
                }}
              >
                {option}
              </Typography>
            );

            return (
              <Chip
                variant="outlined"
                label={content}
                component={'div'}
                {...getItemProps({index})}
                key={index}
              />
            );
          }

          const content = (
            <Typography
              variant="body2"
              sx={{
                display: 'inline',
              }}
            >
              {/* {option.customer_name ? option.customer_name + ' - ' : ''} */}
              {option.project_info ? ` ${option.project_no} -` : option.project_no}
              {option.project_info ? ` ${option.project_info}` : ''}
            </Typography>
          );

          return (
            <Chip
              variant="outlined"
              label={content}
              component={'div'}
              {...getItemProps({index})}
              key={index}
            />
          );
        });
      }}
      renderOption={(props, option) => (
        <li {...props} key={option.project_no}>
          <Typography
            variant="body2"
            sx={{
              display: 'inline',
            }}
          >
            {option.customer_name ? option.customer_name + ' - ' : ''}
            {option.project_info ? ` ${option.project_no} -` : option.project_no}
            {option.project_info ? ` ${option.project_info}` : ''}
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
          placeholder="Vælg projekt(er)..."
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

export default ProjectsFilter;
