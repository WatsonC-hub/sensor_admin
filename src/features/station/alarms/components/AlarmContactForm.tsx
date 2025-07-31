import React, {useState} from 'react';
import {createTypedForm} from '~/components/formComponents/Form';
import {AlarmContactArrayFormValues} from '../schema';
import Button from '~/components/Button';
import {Delete} from '@mui/icons-material';
import {Grid2} from '@mui/material';
import {useSearchContact} from '~/features/stamdata/api/useContactInfo';
import {useAppContext} from '~/state/contexts';
import {ContactInfo} from '~/types';
import useDebouncedValue from '~/hooks/useDebouncedValue';
import {useFormContext} from 'react-hook-form';

interface AlarmContact {
  index: number;
  remove: (index: number) => void;
  searchValue: string | undefined;
}

const AlarmContactTypedForm = createTypedForm<AlarmContactArrayFormValues>();

const AlarmContactForm = ({index, remove, searchValue}: AlarmContact) => {
  const {loc_id} = useAppContext(['loc_id']);
  const [search, setSearch] = useState<string>(searchValue || '');
  const debouncedSearch = useDebouncedValue(search, 500);

  // number 67 is the id for the contact type "Alarm"
  const {data} = useSearchContact(loc_id, debouncedSearch, 67);

  const {
    formState: {errors},
    setValue,
  } = useFormContext<AlarmContactArrayFormValues>();

  return (
    <Grid2
      container
      style={{width: '100%'}}
      alignItems={'center'}
      spacing={1}
      justifyContent={'space-between'}
    >
      <AlarmContactTypedForm.Autocomplete<ContactInfo>
        options={data ?? []}
        labelKey="navn"
        name={`contacts.${index}.contact_id`}
        label={`Kontakt`}
        fullWidth
        error={errors?.contacts?.[index]?.contact_id?.message}
        inputValue={search}
        onSelectChange={(option) => {
          return data?.find((item) => item.id === option) ?? null;
        }}
        textFieldsProps={{
          label: 'Kontakt',
          placeholder: 'Søg og vælg kontakt...',
          required: true,
        }}
        onChangeCallback={(option) => {
          setValue(`contacts.${index}.contact_id`, option ?? undefined);
        }}
        onInputChange={(event, value) => {
          setSearch(value);
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
      />
      <Grid2 size={{xs: 6, sm: 2}} ml={'auto'} mr={2}>
        <Button
          bttype="tertiary"
          startIcon={<Delete />}
          onClick={() => {
            remove(index);
          }}
        >
          Fjern
        </Button>
      </Grid2>
    </Grid2>
  );
};

export default AlarmContactForm;
