import {Grid, InputAdornment, MenuItem} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React, {useEffect} from 'react';
import {useFormContext} from 'react-hook-form';

import {apiClient} from '~/apiClient';
import FormInput from '~/components/FormInput';
import FormTextField from '~/components/FormTextField';

interface TimeseriesTypeSelectProps {
  stationTypes: Array<{tstype_id: number; tstype_name: string}>;
}

const TimeseriesTypeSelect = ({stationTypes}: TimeseriesTypeSelectProps) => {
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
};

interface TimeseriesFormProps {
  mode: string;
}

export default function TimeseriesForm({mode}: TimeseriesFormProps) {
  const {data: timeseries_types} = useQuery({
    queryKey: ['timeseries_types'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/timeseries_types`);
      return data;
    },
  });

  const {watch, unregister} = useFormContext();

  const loc_name = watch('location.loc_name');
  const tstype_id = watch('timeseries.tstype_id');

  useEffect(() => {
    if (mode === 'add' && tstype_id !== 1) {
      unregister('watlevmp');
    }
  }, [tstype_id]);

  return (
    // <FormProvider {...formMethods}>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <FormInput
          name="timeseries.prefix"
          label="Navn"
          InputProps={{
            startAdornment: <InputAdornment position="start">{loc_name + ' - '}</InputAdornment>,
          }}
          placeholder="f.eks. indtag 1"
          fullWidth
          sx={{
            mb: 2,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        {mode === 'add' ? (
          <TimeseriesTypeSelect stationTypes={timeseries_types} />
        ) : (
          <FormTextField
            disabled
            label="Tidsserie type"
            value={
              timeseries_types?.filter(
                (elem: {tstype_id: number; tstype_name: string}) => elem.tstype_id == tstype_id
              )[0]?.tstype_name
            }
          />
        )}
      </Grid>
      {mode === 'add' && tstype_id === 1 && (
        <>
          <Grid item xs={12} sm={6} md={2}>
            <FormInput
              type="number"
              label="Målepunktskote"
              name="watlevmp.elevation"
              required
              fullWidth
              sx={{
                mb: 2,
              }}
              InputProps={{
                endAdornment: <InputAdornment position="start">m</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormInput
              label="Målepunkt placering"
              name="watlevmp.description"
              required
              fullWidth
              sx={{
                mb: 2,
              }}
              placeholder="f.eks. top af rør"
            />
          </Grid>
        </>
      )}
      <Grid item xs={12} sm={6}>
        <FormInput
          type="number"
          label="Evt. loggerdybde under målepunkt"
          name="timeseries.sensor_depth_m"
          fullWidth
          sx={{
            mb: 2,
          }}
          InputProps={{
            endAdornment: <InputAdornment position="start">m</InputAdornment>,
          }}
        />
      </Grid>
    </Grid>
  );
}
