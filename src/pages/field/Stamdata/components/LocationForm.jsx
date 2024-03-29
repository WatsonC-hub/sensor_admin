import {Button, Grid, InputAdornment, MenuItem} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import FormInput from 'src/components/FormInput';
import {getDTMQuota} from '../../fieldAPI';
import LocationTypeSelect from './LocationTypeSelect';

export default function LocationForm({mode, disable}) {
  const {
    data: DTMData,
    isFetching,
    refetch: refetchDTM,
  } = useQuery(['dtm'], () => getDTMQuota(getValues()?.location.x, getValues()?.location.y), {
    refetchOnWindowFocus: false,
    enabled: false,
    onSuccess: (data) => {
      if (data.HentKoterRespons.data[0].kote !== null) {
        setValue('location.terrainlevel', Number(data.HentKoterRespons.data[0].kote.toFixed(3)));
      }
    },
  });

  const {
    reset,
    handleSubmit,
    watch,
    control,
    register,
    setValue,
    formState: {isSubmitSuccessful, errors},
    getValues,
  } = useFormContext();

  const watchTerrainqual = watch('location.terrainqual', '');

  const gridsize = mode === 'modal' ? 12 : 6;

  return (
    // <FormProvider {...formMethods}>
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={gridsize}>
        <FormInput
          name="location.loc_name"
          label="Navn"
          required
          fullWidth
          autoFocus
          placeholder="f.eks. Engsø"
          sx={{
            mb: 2,
          }}
          disabled={disable}
        />
      </Grid>
      <Grid item xs={12} sm={gridsize}>
        <FormInput
          name="location.mainloc"
          label="Hoved lokation"
          fullWidth
          placeholder="f.eks. Aarhus Kommune"
          sx={{
            mb: 2,
          }}
          disabled={disable}
        />
      </Grid>
      <Grid item xs={12} sm={gridsize}>
        <FormInput
          name="location.x"
          label="X-koordinat (UTM)"
          required
          type="number"
          fullWidth
          warning={(value) => {
            if (value < 400000 || value > 900000) {
              return 'X-koordinat er uden for Danmark';
            }
          }}
          sx={{
            mb: 2,
          }}
          disabled={disable}
        />
      </Grid>
      <Grid item xs={12} sm={gridsize}>
        <FormInput
          name="location.y"
          label="Y-koordinat (UTM)"
          required
          type="number"
          fullWidth
          warning={(value) => {
            if (value < 600000 || value > 9000000) {
              return 'Y-koordinat er uden for Danmark';
            }
          }}
          sx={{
            mb: 2,
          }}
          disabled={disable}
        />
      </Grid>
      <Grid item xs={6} sm={gridsize / 2} md={gridsize / 2}>
        <FormInput
          name="location.terrainlevel"
          label="Terrænkote"
          type="number"
          InputProps={{
            endAdornment: <InputAdornment position="start">m</InputAdornment>,
          }}
          fullWidth
          sx={{
            mb: 2,
          }}
          disabled={disable}
        />
      </Grid>
      <Grid item xs={6} sm={gridsize / 2} md={gridsize / 4}>
        <FormInput
          name="location.terrainqual"
          label="Type af terrænkote"
          select
          fullWidth
          sx={{
            mb: 2,
          }}
          disabled={disable}
        >
          <MenuItem value=""> Vælg type </MenuItem>
          <MenuItem value="dGPS">dGPS</MenuItem>
          <MenuItem value="DTM">DTM</MenuItem>
        </FormInput>
      </Grid>
      <Grid item xs={6} sm={gridsize / 2} md={gridsize / 4}>
        {watchTerrainqual === 'DTM' && !disable ? (
          <Button variant="contained" color="secondary" onClick={refetchDTM}>
            Hent DTM
          </Button>
        ) : null}
      </Grid>
      <Grid item xs={12} sm={gridsize}>
        <LocationTypeSelect disable={disable} />
      </Grid>
      <Grid item xs={12} sm={gridsize}>
        <FormInput
          name="location.description"
          label="Beskrivelse"
          fullWidth
          sx={{
            mb: 2,
          }}
          disabled={disable}
          placeholder="f.eks. ligger tæt ved broen"
        />
      </Grid>
    </Grid>
  );
}
