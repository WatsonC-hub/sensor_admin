import React, {useEffect} from 'react';
import {Grid, TextField, MenuItem, CircularProgress} from '@mui/material';
import {InputAdornment} from '@mui/material';
import {stamdataStore} from '../../../../state/store';
import {useQuery} from '@tanstack/react-query';
import FormTextField from './FormTextField';
import FormInput from 'src/components/FormInput';
import {apiClient} from 'src/apiClient';
import {useFormContext} from 'react-hook-form';

const TimeseriesTypeSelect = ({stationTypes}) => {
  let menuItems = stationTypes
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

export default function TimeseriesForm({mode}) {
  const {data: timeseries_types} = useQuery(['timeseries_types'], async () => {
    const {data} = await apiClient.get(`/sensor_field/timeseries_types`);
    return data;
  });

  const formMethods = useFormContext();

  const loc_name = formMethods.watch('location.loc_name');
  const tstype_id = formMethods.watch('timeseries.tstype_id');

  useEffect(() => {
    if (mode === 'add' && tstype_id !== 1) {
      formMethods.unregister('watlevmp');
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
          required
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
            value={timeseries_types?.filter((elem) => elem.tstype_id == tstype_id)[0]?.tstype_name}
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
        </>
      )}
    </Grid>
  );
}
