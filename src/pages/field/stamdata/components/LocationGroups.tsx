import {Typography} from '@mui/material';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import {useQuery} from '@tanstack/react-query';

import Button from '~/components/Button';
import {getGroupLink} from '~/helpers/links';
import {Group} from '~/types';

import {apiClient} from '../../fieldAPI';

const filter = createFilterOptions<Group>({
  ignoreCase: true,
  ignoreAccents: true,
});

interface LocationGroupsProps {
  value: Array<Group> | undefined | null;
  setValue: (value: Array<Group>) => void;
  label?: string;
  disable?: boolean;
}

const LocationGroups = ({
  value,
  setValue,
  label = 'Gruppering',
  disable = false,
}: LocationGroupsProps) => {
  const {data: options} = useQuery({
    queryKey: ['location_groups'],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Group>>('/sensor_field/stamdata/location_groups');
      return data;
    },
  });
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
      disabled={disable}
      value={value ?? []}
      autoHighlight={true}
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
      isOptionEqualToValue={(option, value) => {
        return option.id === value.id;
      }}
      renderTags={(value, getTagProps) => {
        return value.map((option, index) => (
          <Chip
            variant="outlined"
            label={
              <Button bttype="link" href={getGroupLink(option.id)} target="_blank">
                <Typography display="inline" variant="body2" color="grey.400">
                  {option.id === '' ? 'ny' : option.id.slice(0, 4)} -{' '}
                </Typography>
                <Typography display="inline" variant="body2">
                  {option.group_name}
                </Typography>
              </Button>
            }
            {...getTagProps({index})}
            key={index}
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
          label={label}
          placeholder="Indtast gruppe(r)..."
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
