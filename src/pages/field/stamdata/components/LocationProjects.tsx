import {Typography} from '@mui/material';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import {useQuery} from '@tanstack/react-query';
import {FieldError, Noop} from 'react-hook-form';

import {apiClient} from '~/apiClient';
import {authStore} from '~/state/store';

interface Project {
  project_no: string;
}

const filter = createFilterOptions<string>();

interface LocationProjectsProps {
  value: string;
  setValue: (value: string) => void;
  onBlur: Noop;
  error: FieldError | undefined;
  disable?: boolean;
}

const LocationProjects = ({value, setValue, onBlur, error, disable}: LocationProjectsProps) => {
  const {data: options} = useQuery({
    queryKey: ['location_projects'],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Project>>(
        '/sensor_field/stamdata/location_projects'
      );
      return data;
    },
  });

  const superUser = authStore().superUser;

  return (
    <>
      <Autocomplete
        //   freeSolo
        forcePopupIcon={false}
        value={value ?? ''}
        onChange={(event, newValue) => {
          setValue(newValue ? newValue : '');
        }}
        id="tags-standard"
        options={(options && options.map((option) => option.project_no)) ?? []}
        disabled={disable}
        getOptionLabel={(option) => {
          return `${option}`;
        }}
        renderTags={(value, getTagProps) => {
          return value.map((option, index) => (
            <Chip
              variant="outlined"
              label={
                <>
                  <Typography display="inline" variant="body2">
                    {option}
                  </Typography>
                </>
              }
              {...getTagProps({index})}
              key={index}
            />
          ));
        }}
        renderOption={(props, option) => (
          <li {...props}>
            <Typography display="inline" variant="body2">
              {option}
            </Typography>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            InputLabelProps={{shrink: true}}
            onBlur={onBlur}
            variant="outlined"
            error={Boolean(error) && superUser}
            helperText={Boolean(error) && superUser && error?.message}
            label="Projekter"
            placeholder="Indtast projekt nummer..."
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
        )}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);
          const {inputValue} = params;

          const isExisting = options.some((option) => inputValue === option);
          if (inputValue !== '' && !isExisting) {
            filtered.push(inputValue);
          }

          return filtered;
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
      />
    </>
  );
};

export default LocationProjects;
