import React, {useEffect, useState} from 'react';
import {Grid, MenuItem, TextField} from '@mui/material';
import {InputAdornment} from '@mui/material';
import {getLocationTypes} from '../../fieldAPI';
import {useQuery} from '@tanstack/react-query';
import FormTextField from './FormTextField';

export default function LocationTypeSelect({selectedLocationType, onChange, disabled}) {
  const {data, isLoading} = useQuery(['location_types'], getLocationTypes, {
    select: (data) =>
      data
        .filter((i) => i.properties.loctype_id !== 0)
        .map((item) => (
          <MenuItem value={item.properties.loctype_id} key={item.properties.loctype_id}>
            {item.properties.loctypename}
          </MenuItem>
        )),
  });

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
      <MenuItem value={-1}>Vælg type</MenuItem>
      {data}
    </FormTextField>
  );
}
