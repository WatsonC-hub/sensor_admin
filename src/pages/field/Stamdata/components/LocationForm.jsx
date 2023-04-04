import React from 'react';
import {Button, Grid, MenuItem, TextField} from '@mui/material';
import {InputAdornment} from '@mui/material';
import LocationTypeSelect from './LocationTypeSelect';
import {useQuery} from '@tanstack/react-query';
import {getDTMQuota} from '../../fieldAPI';
import {FormProvider, Controller} from 'react-hook-form';
import FormInput from 'src/components/FormInput';
import {useFormContext} from 'react-hook-form';

export default function LocationForm({mode}) {
  const {
    data: DTMData,
    isFetching,
    refetch: refetchDTM,
  } = useQuery(['dtm'], () => getDTMQuota(location.x, location.y), {
    refetchOnWindowFocus: false,
    enabled: false,
    onSuccess: (data) => {
      if (data.HentKoterRespons.data[0].kote !== null) {
        setValue('location.terrainlevel', data.HentKoterRespons.data[0].kote.toFixed(3));
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
        />
      </Grid>
      <Grid item xs={12} sm={gridsize}>
        <FormInput
          name="location.mainloc"
          label="Hoved lokation"
          required
          fullWidth
          placeholder="f.eks. Aarhus Kommune"
          sx={{
            mb: 2,
          }}
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
          required
          fullWidth
          sx={{
            mb: 2,
          }}
        />
      </Grid>
      <Grid item xs={6} sm={gridsize / 2} md={gridsize / 4}>
        <FormInput
          name="location.terrainqual"
          label="Type af terrænkote"
          select
          required
          fullWidth
          sx={{
            mb: 2,
          }}
        >
          <MenuItem value=""> Vælg type </MenuItem>
          <MenuItem value="dGPS">dGPS</MenuItem>
          <MenuItem value="DTM">DTM</MenuItem>
        </FormInput>
      </Grid>
      <Grid item xs={6} sm={gridsize / 2} md={gridsize / 4}>
        {watchTerrainqual === 'DTM' ? (
          <Button variant="contained" color="secondary" onClick={refetchDTM}>
            Hent DTM
          </Button>
        ) : null}
      </Grid>
      <Grid item xs={12} sm={gridsize}>
        <LocationTypeSelect />
      </Grid>
      <Grid item xs={12} sm={gridsize}>
        <FormInput
          name="location.description"
          label="Beskrivelse"
          required
          fullWidth
          sx={{
            mb: 2,
          }}
          placeholder="f.eks. ligger tæt ved broen"
        />
      </Grid>
    </Grid>
    // </FormProvider>

    //   <Grid item xs={6} sm={3} md={1.5}>
    //     <FormTextField
    //       disabled={location.loc_name === '' ? true : false}
    //       autoFocus
    //       select
    //       label="Type af terrænkote"
    //       value={location.terrainqual}
    //       onChange={(event) => setLocationValue('terrainqual', event.target.value)}
    //     >
    //       <MenuItem value={-1}> Vælg type </MenuItem>
    //       <MenuItem value="dGPS">dGPS</MenuItem>
    //       <MenuItem value="DTM">DTM</MenuItem>
    //     </FormTextField>
    //   </Grid>
    //   <Grid item xs={6} sm={3} md={1.5}>
    //     {mode === 'edit' && location.terrainqual === 'DTM' ? (
    //       <Button variant="contained" color="secondary" onClick={refetchDTM}>
    //         Hent DTM
    //       </Button>
    //     ) : null}
    //   </Grid>
    //   <Grid item xs={12} sm={6}>
    //     <LocationTypeSelect
    //       selectedLocationType={location.loctype_id}
    //       onChange={(e) => setLocationValue('loctype_id', e.target.value)}
    //       disabled={location.loc_name === '' ? true : false}
    //     />
    //   </Grid>

    //   <Grid item xs={12} sm={6}>
    //     <FormTextField
    //       disabled={location.loc_name === '' ? true : false}
    //       label="Kommentar"
    //       value={location.description}
    //       onChange={(event) => setLocationValue('description', event.target.value)}
    //       placeholder="f.eks. ligger tæt ved broen"
    //     />
    //   </Grid>
    // </Grid>
  );
}
