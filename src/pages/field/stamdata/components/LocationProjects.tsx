import {Chip, Typography} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import {useQuery} from '@tanstack/react-query';
import {FieldError} from 'react-hook-form';

import {apiClient} from '~/apiClient';
import {authStore} from '~/state/store';

interface Project {
  project_no: string;
  customer_name: string | null;
  project_info: string | null;
}

interface LocationProjectsProps {
  value: string;
  setValue: (value: string) => void;
  error: FieldError | undefined;
  disable?: boolean;
}

const LocationProjects = ({value, setValue, error, disable}: LocationProjectsProps) => {
  const {data: options} = useQuery({
    queryKey: ['location_projects'],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Project>>(
        '/sensor_field/stamdata/location_projects'
      );
      return data;
    },
  });

  const superUser = authStore((store) => store.superUser);

  return (
    <>
      <Autocomplete
        forcePopupIcon={false}
        value={options?.find((option) => option.project_no == value) ?? null}
        onChange={(event, newValue) => {
          setValue(newValue ? newValue.project_no : '');
        }}
        id="tags-standard"
        options={options ?? []}
        disabled={disable}
        getOptionLabel={(option) => {
          return `${option.project_no} ${option.customer_name ? ' - ' + option.customer_name : ''} ${option.project_info ? ' - ' + option.project_info : ''}`;
        }}
        isOptionEqualToValue={(option, value) => option.project_no === value.project_no}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            InputLabelProps={{shrink: true}}
            variant="outlined"
            error={Boolean(error) && superUser}
            helperText={Boolean(error) && superUser && error?.message}
            label="Projektnummer"
            placeholder="Vælg projektnummer..."
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
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
      />
    </>
  );
};

export default LocationProjects;
