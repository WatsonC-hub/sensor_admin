import {InputAdornment, Typography} from '@mui/material';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import {useQuery} from '@tanstack/react-query';
import {Noop} from 'react-hook-form';

import Button from '~/components/Button';
import {getGroupLink} from '~/helpers/links';
import {apiClient} from '~/apiClient';
import {Group} from '~/types';
import LinkableTooltip from '~/components/LinkableTooltip';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';

const filter = createFilterOptions<Group>({
  ignoreCase: true,
  ignoreAccents: true,
});

interface LocationGroupsProps {
  value: Array<Group> | undefined | null;
  setValue: (value: Array<Group>) => void;
  onBlur?: Noop;
  label?: string;
  disable?: boolean;
  disableLink?: boolean;
  creatable?: boolean;
  fieldDescriptionText?: string;
}

const LocationGroups = ({
  value,
  setValue,
  onBlur,
  label = 'Gruppering',
  disable = false,
  disableLink = false,
  creatable = true,
  fieldDescriptionText,
}: LocationGroupsProps) => {
  const {data: options} = useQuery({
    queryKey: queryKeys.Groups.all(),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Group>>('/sensor_field/stamdata/location_groups');
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

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
        return `${option.group_name}`;
        // return `${option.id.slice(0, 4)} - ${option.group_name}`;
      }}
      isOptionEqualToValue={(option, value) => {
        return option.id === value.id;
      }}
      renderTags={(value, getTagProps) => {
        return value.map((option, index) => {
          const content = (
            <>
              <Typography display="inline" variant="body2" color="grey.400">
                {option.id === '' && 'Ny - '}
              </Typography>
              <Typography display="inline" variant="body2">
                {option.group_name}
              </Typography>
            </>
          );

          if (disableLink) {
            return (
              <Chip variant="outlined" label={content} {...getTagProps({index})} key={index} />
            );
          }

          return (
            <Chip
              variant="outlined"
              label={
                <Button bttype="link" href={getGroupLink(option.id)} target="_blank">
                  {content}
                </Button>
              }
              {...getTagProps({index})}
              key={index}
            />
          );
        });
      }}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Typography display="inline" variant="body2" color="grey.400">
            {option.id === '' && 'Opret - '}
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
          variant="outlined"
          label={label}
          placeholder="Vælg gruppe(r)..."
          onBlur={onBlur}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  <InputAdornment position="end">
                    {fieldDescriptionText && (
                      <LinkableTooltip fieldDescriptionText={fieldDescriptionText} />
                    )}
                  </InputAdornment>
                </>
              ),
            },
            inputLabel: {
              shrink: true,
            },
          }}
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

        if (creatable && inputValue !== '' && !isExisting) {
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
