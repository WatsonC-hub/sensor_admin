import React, {useState} from 'react';
import {createTypedForm} from '~/components/formComponents/Form';
import {AlarmContactArrayFormValues} from '../schema';
import {Grid2} from '@mui/material';
import {useSearchContact} from '~/features/stamdata/api/useContactInfo';
import {useAppContext} from '~/state/contexts';
import {ContactInfo} from '~/types';
import useDebouncedValue from '~/hooks/useDebouncedValue';
import {useFormContext} from 'react-hook-form';
import SmsIcon from '@mui/icons-material/Sms';
import EmailIcon from '@mui/icons-material/Email';
import CallIcon from '@mui/icons-material/Call';
import CloseIcon from '@mui/icons-material/Close';

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
    <Grid2 container style={{width: '100%'}} alignItems={'center'} spacing={2}>
      <AlarmContactTypedForm.Autocomplete<ContactInfo>
        options={data ?? []}
        labelKey="navn"
        name={`contacts.${index}.contact_id`}
        label={`Kontakt`}
        fullWidth
        gridSizes={{xs: 12, sm: 6}}
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
      <AlarmContactTypedForm.Checkbox
        name={`contacts.${index}.sms`}
        icon={<SmsIcon color="primary" />}
        gridSizes={{xs: 12, sm: 1.7}}
      />
      <AlarmContactTypedForm.Checkbox
        name={`contacts.${index}.email`}
        icon={<EmailIcon color="primary" />}
        gridSizes={{xs: 12, sm: 1.7}}
      />
      <AlarmContactTypedForm.Checkbox
        name={`contacts.${index}.call`}
        icon={<CallIcon color="primary" />}
        gridSizes={{xs: 12, sm: 1.7}}
      />
      <Grid2 size={{xs: 12, sm: 0.9}} pr={1} style={{display: 'flex', justifyContent: 'center'}}>
        <CloseIcon color="action" sx={{cursor: 'pointer'}} onClick={() => remove(index)} />
      </Grid2>
    </Grid2>
  );
};

export default AlarmContactForm;
