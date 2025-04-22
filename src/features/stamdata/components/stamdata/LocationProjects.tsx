import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {Link} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import {useQuery} from '@tanstack/react-query';
import {FieldError, Noop} from 'react-hook-form';

import {apiClient} from '~/apiClient';
import {useUser} from '~/features/auth/useUser';

interface Project {
  project_no: string;
  customer_name: string | null;
  project_info: string | null;
}

interface LocationProjectsProps {
  value: string | undefined;
  setValue: (value: string | undefined) => void;
  onBlur: Noop;
  error: FieldError | undefined;
  disable?: boolean;
}

const getLabel = (project: Project | null) => {
  if (!project) return '';
  return `${project.project_no} ${project.customer_name ? ' - ' + project.customer_name : ''} ${project.project_info ? ' - ' + project.project_info : ''}`;
};

const LocationProjects = ({value, setValue, error, onBlur, disable}: LocationProjectsProps) => {
  const {data: options} = useQuery({
    queryKey: ['location_projects'],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Project>>(
        '/sensor_field/stamdata/location_projects'
      );
      return data;
    },
  });

  const user = useUser();

  const selectedValue = options?.find((option) => option.project_no == value) ?? null;

  return (
    <>
      {disable == false && (
        <Autocomplete
          sx={{
            marginTop: '8px',
            marginBottom: '4px',
            pb: 1.5,
          }}
          forcePopupIcon={false}
          value={selectedValue}
          onChange={(event, newValue) => {
            setValue(newValue ? newValue.project_no : undefined);
          }}
          id="tags-standard"
          options={options ?? []}
          disabled={disable}
          getOptionLabel={getLabel}
          isOptionEqualToValue={(option, value) => option.project_no === value.project_no}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              onBlur={onBlur}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              variant="outlined"
              error={Boolean(error) && user?.superUser}
              helperText={Boolean(error) && user?.superUser && error?.message}
              label="Projektnummer"
              placeholder="Vælg projektnummer..."
              sx={{
                pb: 1,
                '& .MuiInputBase-input.Mui-disabled': {WebkitTextFillColor: '#000000'},
                '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
                '& .MuiInputLabel-root.Mui-disabled': {color: 'rgba(0, 0, 0, 0.38)'}, //styles the label
                '& .MuiOutlinedInput-root': {'& > fieldset': {borderColor: 'primary.main'}},
                '.MuiFormHelperText-root': {position: 'absolute', top: '90%'},
              }}
            />
          )}
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
        />
      )}
      {disable == true && (
        <TextField
          fullWidth
          slotProps={{
            inputLabel: {
              shrink: true,
            },
            input: {
              endAdornment: (
                <Link
                  href={`https://www.watsonc.dk/calypso/projekt/?project=${selectedValue?.project_no}`}
                  target="_blank"
                  rel="noopener"
                >
                  <OpenInNewIcon />
                </Link>
              ),
            },
          }}
          variant="outlined"
          label="Projektnummer"
          placeholder="Vælg projektnummer..."
          value={getLabel(selectedValue)}
          disabled
          sx={{
            marginTop: '8px',
            marginBottom: '4px',
            pb: 1.5,
            '& .MuiInputBase-input.Mui-disabled': {WebkitTextFillColor: '#000000'},
            '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
            '& .MuiInputLabel-root.Mui-disabled': {color: 'rgba(0, 0, 0, 0.38)'}, //styles the label
            '& .MuiOutlinedInput-root': {'& > fieldset': {borderColor: 'primary.main'}},
            '.MuiFormHelperText-root': {position: 'absolute', top: '90%'},
          }}
        />
      )}
    </>
  );
};

export default LocationProjects;
