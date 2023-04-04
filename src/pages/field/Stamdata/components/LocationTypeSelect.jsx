import React, {useState} from 'react';
import {Grid, MenuItem, TextField} from '@mui/material';

import {useQuery} from '@tanstack/react-query';
import FormTextField from './FormTextField';
import {apiClient} from 'src/apiClient';
import FormInput from 'src/components/FormInput';

export default function LocationTypeSelect({}) {
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

  return (
    <FormInput
      name="location.loctype_id"
      label="Lokationstype"
      select
      required
      fullWidth
      sx={{
        mb: 2,
      }}
    >
      <MenuItem value={-1} key={-1}>
        Vælg type
      </MenuItem>
      {data?.map((item) => (
        <MenuItem value={item.loctype_id} key={item.loctype_id}>
          {item.loctypename}
        </MenuItem>
      ))}
    </FormInput>
  );
}
