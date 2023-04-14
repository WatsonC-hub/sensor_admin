import React from 'react';
import {Grid, MenuItem, TextField} from '@mui/material';

import {useQuery} from '@tanstack/react-query';
import FormTextField from './FormTextField';
import {apiClient} from 'src/apiClient';

export default function LocationTypeSelect({selectedLocationType, onChange, disabled}) {
  const {data} = useQuery(
    ['location_types'],
    async () => {
      const {data} = await apiClient.get(`/sensor_field/stamdata/location_types`);
      return data;
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  const handleSelection = (event) => {
    onChange(event);
  };

  return (
    <FormTextField
      disabled={disabled}
      select
      value={selectedLocationType}
      onChange={handleSelection}
      label="Lokation type"
    >
      <MenuItem value={-1} key={-1}>
        Vælg type
      </MenuItem>
      {data?.map((item) => (
        <MenuItem value={item.loctype_id} key={item.loctype_id}>
          {item.loctypename}
        </MenuItem>
      ))}
    </FormTextField>
  );
}
