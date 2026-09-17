import {Box} from '@mui/material';
import React from 'react';

import FormAutocomplete from '~/components/formComponents/FormAutocomplete';
import TooltipWrapper from '~/components/TooltipWrapper';
import {useLocationData} from '~/hooks/query/useMetadata';
import {useAppContext} from '~/state/contexts';

import type {AlarmFormInput} from '../schema';

type AlarmGroupOptions = {
  group_id: string;
  group_name: string;
};

interface AlarmGroupProps {
  disableClearable?: boolean;
}

const AlarmGroup = ({disableClearable = false}: AlarmGroupProps) => {
  const {loc_id} = useAppContext(['loc_id']);
  const {data: location_data} = useLocationData(loc_id);
  const options: AlarmGroupOptions[] =
    location_data?.groups?.map((group) => ({
      group_id: group.id,
      group_name: group.group_name,
    })) ?? [];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <TooltipWrapper
        description={
          'Når du tilknytter en alarm til en gruppe, vises den på alle gruppens lokationer, men mister tilknytningen til tidsserien. Fjernes gruppen senere, forsvinder alarmen fra disse lokationer.' +
          (location_data?.groups ? ' ' : ' (Ingen grupper tilgængelige)')
        }
      >
        <FormAutocomplete<AlarmFormInput, AlarmGroupOptions, false>
          labelKey="group_name"
          valueKey="group_id"
          disabled={options === undefined || options.length === 0}
          name="group_id"
          options={options}
          disableClearable={disableClearable}
          fullWidth
          gridSizes={12}
          textFieldsProps={{
            label: 'Lokationsgrupper',
            placeholder: ' Vælg lokationsgruppe...',
            required: true,
          }}
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
        />
      </TooltipWrapper>
    </Box>
  );
};

export default AlarmGroup;
