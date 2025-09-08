import {Tooltip} from '@mui/material';
import React from 'react';
import FormAutocomplete from '~/components/formComponents/FormAutocomplete';
import {useLocationData} from '~/hooks/query/useMetadata';
import {useAppContext} from '~/state/contexts';
import {AlarmsFormValues} from '../schema';
import {useFormContext} from 'react-hook-form';

type AlarmGroupOptions = {
  group_id: string;
  group_name: string;
};

const AlarmGroup = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const {setValue, trigger} = useFormContext<AlarmsFormValues>();
  const {data: location_data} = useLocationData(loc_id);
  const options: AlarmGroupOptions[] =
    location_data?.groups?.map((group) => ({
      group_id: group.id,
      group_name: group.group_name,
    })) ?? [];

  return (
    <Tooltip title={location_data?.groups ? '' : 'Ingen grupper tilgængelige på lokationen'} arrow>
      <FormAutocomplete<AlarmsFormValues, AlarmGroupOptions, false>
        labelKey="group_name"
        disabled={options === undefined || options.length === 0}
        name="group_id"
        options={options}
        onChangeCallback={(value) => {
          if (value && value.group_id) {
            setValue(`group_id`, value.group_id);
            trigger(`group_id`);
          }
        }}
        getOptionLabel={(o) => {
          if (!o) return '';

          if (typeof o === 'string') {
            return location_data?.groups?.find((item) => item.id === o)?.group_name ?? '';
          }

          return o.group_name;
        }}
        label={'Lokationsgrupper'}
        fullWidth
        gridSizes={12}
        textFieldsProps={{
          label: 'Lokationsgrupper',
          placeholder: ' Vælg lokationsgruppe...',
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
      />
    </Tooltip>
  );
};

export default AlarmGroup;
