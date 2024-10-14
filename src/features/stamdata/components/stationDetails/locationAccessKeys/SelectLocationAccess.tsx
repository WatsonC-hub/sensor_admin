import {Autocomplete, TextField, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';

import {initialLocationAccessData} from '~/consts';
import {useLocationAccess} from '~/features/stamdata/api/useLocationAccess';
import {Access} from '~/types';

type Props = {
  loc_id: number | undefined;
  createNew: boolean;
  setCreateNew: (createNew: boolean) => void;
};

const SelectLocationAccess = ({loc_id, createNew, setCreateNew}: Props) => {
  const [selected, setSelected] = useState<Access | null>(null);
  const [search, setSearch] = useState<string>('');
  const {reset} = useFormContext();
  const {useSearchLocationAccess} = useLocationAccess(loc_id);

  const {data} = useSearchLocationAccess(search);

  useEffect(() => {
    if (!createNew) {
      setSelected(null);
      setSearch('');
    }
  }, [createNew]);

  return (
    <Autocomplete
      sx={{mt: 1}}
      options={data ?? []}
      value={selected ?? null}
      inputValue={search}
      getOptionLabel={(option) => {
        return `${option.navn}`;
      }}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderOption={(props, option) => {
        return (
          <li {...props} key={option.id}>
            <Typography>{option.navn}</Typography>
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          InputLabelProps={{shrink: true}}
          variant="outlined"
          label={'Søg eksisterende nøgle/kode'}
          placeholder="Søg efter en nøgle eller kode..."
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
          reset(newValue);
          setCreateNew(true);
        } else {
          setCreateNew(false);
          reset(initialLocationAccessData);
        }
      }}
      onInputChange={(event, value) => {
        setSearch(value);
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
    />
  );
};

export default SelectLocationAccess;
