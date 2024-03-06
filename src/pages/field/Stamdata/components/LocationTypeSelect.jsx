import {MenuItem} from '@mui/material';
import React from 'react';

import {useQuery} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';
import FormInput from 'src/components/FormInput';

export default function LocationTypeSelect({disable}) {
  const {data} = useQuery({
    queryKey: ['location_types'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/stamdata/location_types`);
      return data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

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
      disabled={disable}
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
