import {Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';

import {TypedFormComponent} from '~/components/formComponents/Form';
import {useSearchLocationAccess} from '~/features/stamdata/api/useLocationAccess';
import useDebouncedValue from '~/hooks/useDebouncedValue';
import {Access} from '~/types';

type Props = {
  loc_id: number | undefined;
  showLocationAccessForm?: boolean;
  setShowLocationAccessForm: (showLocationAccessForm: boolean) => void;
  disabled?: boolean;
  Form: TypedFormComponent<Access, Access>;
};

const SelectLocationAccess = ({
  loc_id,
  showLocationAccessForm = false,
  setShowLocationAccessForm,
  disabled = false,
  Form,
}: Props) => {
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebouncedValue(search, 500);

  const {data, isFetching} = useSearchLocationAccess(loc_id, debouncedSearch);

  const {reset} = useFormContext<Access>();

  useEffect(() => {
    if (!showLocationAccessForm) {
      setSearch('');
    }
  }, [showLocationAccessForm]);

  return (
    <Form.Autocomplete<Access, false>
      options={data ?? []}
      loading={isFetching}
      labelKey="navn"
      valueKey="id"
      name="id"
      filterOptions={(options) => {
        return options;
      }}
      inputValue={search}
      onChangeCallback={(value) => {
        if (value !== null) {
          reset(value);
          setShowLocationAccessForm(true);
        }
      }}
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
  );
};

export default SelectLocationAccess;
