import React from 'react';
import {Button, Grid, MenuItem, TextField} from '@mui/material';
import {InputAdornment} from '@mui/material';
import LocationTypeSelect from './LocationTypeSelect';
import {stamdataStore} from '../../../../state/store';
import FormTextField from './FormTextField';
import {useQuery} from '@tanstack/react-query';
import {getDTMQuota} from '../../fieldAPI';

export default function LocationForm({mode}) {
  const [location, setLocationValue] = stamdataStore((store) => [
    store.location,
    store.setLocationValue,
  ]);

  const {
    data: DTMData,
    isFetching,
    refetch: refetchDTM,
  } = useQuery(['dtm'], () => getDTMQuota(location.x, location.y), {
    refetchOnWindowFocus: false,
    enabled: false,
    onSuccess: (data) => {
      if (data.HentKoterRespons.data[0].kote !== null) {
        setLocationValue('terrainlevel', data.HentKoterRespons.data[0].kote.toFixed(3));
      }
    },
  });

  // console.log("got formdata => ", formData);

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={6}>
        <FormTextField
          disabled={location.loc_name === '' && mode != 'edit' ? true : false}
          label="Navn"
          value={location.loc_name}
          onChange={(event) => {
            setLocationValue('loc_name', event.target.value);
          }}
          placeholder="f.eks. Brabrand_1"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormTextField
          disabled={location.loc_name === '' ? true : false}
          label="Hoved lokation"
          value={location.mainloc}
          onChange={(event) => setLocationValue('mainloc', event.target.value)}
          placeholder="f.eks. Aarhus Kommune"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormTextField
          disabled={location.loc_name === '' ? true : false}
          type="number"
          label="X-koordinat (UTM)"
          value={location.x}
          onChange={(event) => setLocationValue('x', event.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormTextField
          disabled={location.loc_name === '' ? true : false}
          type="number"
          label="Y-koordinat (UTM)"
          value={location.y}
          onChange={(event) => setLocationValue('y', event.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <FormTextField
          InputProps={{
            endAdornment: <InputAdornment position="start">m</InputAdornment>,
          }}
          disabled={location.loc_name === '' ? true : false}
          type="number"
          label="Terrænkote"
          value={location.terrainlevel}
          onChange={(event) => setLocationValue('terrainlevel', event.target.value)}
        />
      </Grid>
      <Grid item xs={6} sm={3} md={1.5}>
        <FormTextField
          disabled={location.loc_name === '' ? true : false}
          autoFocus
          select
          label="Type af terrænkote"
          value={location.terrainqual}
          onChange={(event) => setLocationValue('terrainqual', event.target.value)}
        >
          <MenuItem value={-1}> Vælg type </MenuItem>
          <MenuItem value="dGPS">dGPS</MenuItem>
          <MenuItem value="DTM">DTM</MenuItem>
        </FormTextField>
      </Grid>
      <Grid item xs={6} sm={3} md={1.5}>
        {mode === 'edit' && location.terrainqual === 'DTM' ? (
          <Button variant="contained" color="secondary" onClick={refetchDTM}>
            Hent DTM
          </Button>
        ) : null}
      </Grid>
      <Grid item xs={12} sm={6}>
        <LocationTypeSelect
          selectedLocationType={location.loctype_id}
          onChange={(e) => setLocationValue('loctype_id', e.target.value)}
          disabled={location.loc_name === '' ? true : false}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormTextField
          disabled={location.loc_name === '' ? true : false}
          label="Kommentar"
          value={location.description}
          onChange={(event) => setLocationValue('description', event.target.value)}
          placeholder="f.eks. ligger tæt ved broen"
        />
      </Grid>
    </Grid>
  );
}
