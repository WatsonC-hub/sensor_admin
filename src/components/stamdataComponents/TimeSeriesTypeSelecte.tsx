import {MenuItem} from '@mui/material';
import React from 'react';

import FormInput from '~/components/formComponents/FormInput';
import {timeSeriesType} from '~/types';

interface TimeSeriesTypeList {
  stationTypes: timeSeriesType[];
}

export default function TimeseriesTypeSelect({stationTypes}: TimeSeriesTypeList) {
  const menuItems = stationTypes
    ?.filter((i) => i.tstype_id !== 0)
    ?.map((item) => (
      <MenuItem value={item.tstype_id} key={item.tstype_id}>
        {item.tstype_name}
      </MenuItem>
    ));

  return (
    <FormInput
      name="timeseries.tstype_id"
      label="Tidsserietype"
      select
      required
      fullWidth
      sx={{
        mb: 2,
      }}
    >
      <MenuItem value={-1}>Vælg type</MenuItem>
      {menuItems}
    </FormInput>
  );
}
