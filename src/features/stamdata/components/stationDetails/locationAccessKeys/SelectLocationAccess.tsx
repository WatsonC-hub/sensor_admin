import {Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';

import ExtendedAutocomplete from '~/components/Autocomplete';
import {initialLocationAccessData} from '~/consts';
import {useSearchLocationAccess} from '~/features/stamdata/api/useLocationAccess';
import useDebouncedValue from '~/hooks/useDebouncedValue';
import {Access} from '~/types';

type Props = {
  loc_id: number | undefined;
  showLocationAccessForm: boolean;
  setShowLocationAccessForm: (showLocationAccessForm: boolean) => void;
  disabled?: boolean;
};

const SelectLocationAccess = ({
  loc_id,
  showLocationAccessForm,
  setShowLocationAccessForm,
  disabled = false,
}: Props) => {
  const [selected, setSelected] = useState<Access | null>(null);
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebouncedValue(search, 500);
  const {reset} = useFormContext<Access>();

  const {data, isFetching} = useSearchLocationAccess(loc_id, debouncedSearch);

  useEffect(() => {
    if (!showLocationAccessForm) {
      setSelected(null);
      setSearch('');
    }
  }, [showLocationAccessForm]);

  return (
    <>
      <ExtendedAutocomplete<Access>
        options={data ?? []}
        loading={isFetching}
        labelKey="navn"
        onChange={(option) => {
          setSelected(option);
          if (option) {
            reset(option);
            setShowLocationAccessForm(true);
          } else {
            setShowLocationAccessForm(false);
            reset(initialLocationAccessData);
          }
        }}
        selectValue={selected ?? null}
        filterOptions={(options) => {
          return options;
        }}
        inputValue={search}
        renderOption={(props, option) => {
          return (
            <li {...props} key={option.id}>
              <Typography>{option.navn}</Typography>
            </li>
          );
        }}
        textFieldsProps={{
          label: 'Søg eksisterende nøgle/kode',
          placeholder: 'Søg efter en nøgle eller kode...',
        }}
        onInputChange={(event, value) => {
          setSearch(value);
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        disabled={disabled}
      />
    </>
  );
};

export default SelectLocationAccess;
