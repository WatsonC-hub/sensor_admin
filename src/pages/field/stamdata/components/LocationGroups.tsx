import {Typography} from '@mui/material';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import {useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';

interface Group {
  id: string;
  group_name: string;
  new?: boolean;
}

const filter = createFilterOptions<Group>();

interface LocationGroupsProps {
  value: Array<Group>;
  setValue: (value: Array<Group>) => void;
}

const LocationGroups = ({value, setValue}: LocationGroupsProps) => {
  const {data: options} = useQuery({
    queryKey: ['location_groups'],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Group>>('/sensor_field/stamdata/location_groups');
      return data;
    },
  });

  return (
    <Autocomplete
      freeSolo
      forcePopupIcon={false}
      multiple
      value={value ?? []}
      onChange={(event, newValue) => {
        setValue(
          newValue.map((item) => {
            if (typeof item === 'string') {
              return {group_name: item, id: ''};
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
        if (option.id === '') {
          return `ny - ${option.group_name}`;
        }

        return `${option.id.slice(0, 4)} - ${option.group_name}`;
      }}
      renderTags={(value, getTagProps) => {
        value.forEach((option) => console.log('option', option.id));
        return value.map((option, index) => (
          <Chip
            key={index}
            variant="outlined"
            label={
              <>
                <Typography display="inline" variant="body2" color="grey.400">
                  {option.id === '' ? 'ny' : option.id.slice(0, 4)} -{' '}
                </Typography>
                <Typography display="inline" variant="body2">
                  {option.group_name}
                </Typography>
              </>
            }
            {...getTagProps({index})}
          />
        ));
      }}
      renderOption={(props, option) => (
        <li {...props}>
          <Typography display="inline" variant="body2" color="grey.400">
            {option.id === '' ? 'Opret' : option.id.slice(0, 4)} -
          </Typography>
          <Typography display="inline" variant="body2">
            {option.group_name}
          </Typography>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          InputLabelProps={{shrink: true}}
          variant="outlined"
          label="Gruppering"
          placeholder="Indtast gruppe..."
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
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const {inputValue} = params;
        // Suggest the creation of a new value
        const isExisting = options.some((option) => inputValue === option.group_name);
        if (inputValue !== '' && !isExisting) {
          filtered.push({
            id: '',
            group_name: inputValue,
          });
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
    />
  );
};

export default LocationGroups;
