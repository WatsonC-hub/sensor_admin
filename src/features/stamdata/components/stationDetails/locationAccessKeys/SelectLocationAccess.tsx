import {Autocomplete, createFilterOptions, TextField} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';

import {useLocationAccess} from '~/features/stamdata/api/useLocationAccess';
import {Access} from '~/types';

type Props = {
  loc_id: number | undefined;
};

const filter = createFilterOptions<Access>({
  ignoreCase: true,
  ignoreAccents: true,
});

const initialData = {
  navn: '',
  type: '',
  contact_id: null,
  placering: '',
  koden: '',
  kommentar: '',
};

const SelectLocationAccess = ({loc_id}: Props) => {
  const [selected, setSelected] = useState<Access | null>(null);
  const [search, setSearch] = useState<string>('');
  const [selectDataOptions, setSelectDataOptions] = useState<Array<Access>>([]);
  const {setValue} = useFormContext();
  const {
    relevant_location_access: {data: relevantLocationAccess},
    useSearchLocationAccess,
  } = useLocationAccess(loc_id);

  const searchedData = useSearchLocationAccess(search);
  useEffect(() => {
    if (search !== '' && searchedData) {
      setSelectDataOptions([...searchedData]);
    } else {
      if (relevantLocationAccess) setSelectDataOptions([...relevantLocationAccess]);
    }
  }, [search, relevantLocationAccess, searchedData]);

  return (
    <Autocomplete
      sx={{mt: 1}}
      options={selectDataOptions ?? []}
      value={selected ?? null}
      disableCloseOnSelect
      getOptionLabel={(option) => {
        return `${option.navn}`;
      }}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          InputLabelProps={{shrink: true}}
          variant="outlined"
          label={'Søg eksisterende nøgle/kode'}
          placeholder="Indtast nøgle eller kode..."
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
      onChange={(event, newValue) => {
        setSelected(newValue);
        if (newValue) {
          setValue('adgangsforhold', newValue);
        } else setValue('adgangsforhold', initialData);
      }}
      filterSelectedOptions
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const {inputValue} = params;
        setSearch(inputValue);
        // Suggest the creation of a new value
        const isExisting = options.some((option) => inputValue === option.navn);
        if (inputValue !== '' && !isExisting) {
          filtered.push({
            id: -1,
            navn: inputValue,
          });
        } else if (isExisting) filtered.push(options.find((option) => option.navn === inputValue)!);

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
    />
  );
};

export default SelectLocationAccess;
