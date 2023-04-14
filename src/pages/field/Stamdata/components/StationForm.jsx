import React, {useEffect} from 'react';
import {Grid, TextField, MenuItem, CircularProgress} from '@mui/material';
import {InputAdornment} from '@mui/material';
import {stamdataStore} from '../../../../state/store';
import {useQuery} from '@tanstack/react-query';
import FormTextField from './FormTextField';
import {apiClient} from 'src/apiClient';

const StationTypeSelect = ({
  selectedStationType,
  setSelectedStationType,
  stationTypes,
  onChange,
  isLoading,
}) => {
  const handleSelection = (event) => {
    setSelectedStationType(event.target.value);
    onChange(event);
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  let menuItems = stationTypes
    .filter((i) => i.tstype_id !== 0)
    .map((item) => (
      <MenuItem value={item.tstype_id} key={item.tstype_id}>
        {item.tstype_name}
      </MenuItem>
    ));

  return (
    <FormTextField
      select
      value={selectedStationType}
      onChange={handleSelection}
      label="Station type"
    >
      <MenuItem value={-1}>Vælg type</MenuItem>
      {menuItems}
    </FormTextField>
  );
};

export default function StationForm({mode, selectedStationType, setSelectedStationType}) {
  const [timeseries, setTimeseriesValue] = stamdataStore((store) => [
    store.timeseries,
    store.setTimeseriesValue,
  ]);
  // const [timeseties_types, setStationTypes] = React.useState([]);

  const {data: timeseries_types, isLoading} = useQuery(['timeseries_types'], async () => {
    const {data} = await apiClient.get(`/sensor_field/timeseries_types`);
    return data;
  });

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <FormTextField
          label="Navn"
          value={timeseries.ts_name}
          placeholder="f.eks. Brabrand_1_vandstand"
          onChange={(e) => setTimeseriesValue('ts_name', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        {mode === 'add' ? (
          <StationTypeSelect
            selectedStationType={selectedStationType}
            setSelectedStationType={setSelectedStationType}
            stationTypes={timeseries_types}
            isLoading={isLoading}
            onChange={(e) => setTimeseriesValue('tstype_id', e.target.value)}
          />
        ) : (
          <FormTextField
            disabled
            label="Station type"
            value={
              timeseries_types?.filter((elem) => elem.tstype_id == timeseries.tstype_id)[0]
                ?.tstype_name
            }
          />
        )}
      </Grid>
      {mode === 'add' && selectedStationType === 1 && (
        <Grid item xs={12} sm={6} md={2}>
          <FormTextField
            type="number"
            label="Målepunktskote"
            value={timeseries.maalepunktskote}
            InputProps={{
              endAdornment: <InputAdornment position="start">m</InputAdornment>,
            }}
            onChange={(e) => setTimeseriesValue('maalepunktskote', e.target.value)}
          />
        </Grid>
      )}
      {mode === 'add' && selectedStationType === 1 && (
        <Grid item xs={12} sm={6} md={4}>
          <FormTextField
            label="Målepunkt placering"
            value={timeseries.mp_description}
            placeholder="f.eks. top af rør"
            onChange={(e) => setTimeseriesValue('mp_description', e.target.value)}
          />
        </Grid>
      )}
      <Grid item xs={12} sm={6}>
        <FormTextField
          type="number"
          label="Evt. loggerdybde under målepunkt"
          value={timeseries.sensor_depth_m}
          InputProps={{
            endAdornment: <InputAdornment position="start">m</InputAdornment>,
          }}
          onChange={(e) => setTimeseriesValue('sensor_depth_m', e.target.value)}
        />
      </Grid>
    </Grid>
  );
}
