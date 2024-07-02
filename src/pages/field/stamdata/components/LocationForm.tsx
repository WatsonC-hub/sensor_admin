import {Grid, InputAdornment, MenuItem} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {useEffect} from 'react';
import {useFormContext, Controller} from 'react-hook-form';

import FormInput from '~/components/FormInput';
import {authStore, stamdataStore} from '~/state/store';

import {getDTMQuota} from '../../fieldAPI';

import LocationGroups from './LocationGroups';
import LocationProjects from './LocationProjects';
import LocationTypeSelect from './LocationTypeSelect';

interface Props {
  mode: 'modal' | 'normal';
  disable?: boolean;
}

export default function LocationForm({mode, disable = false}: Props) {
  const {
    data: DTMData,
    isSuccess,
    refetch: refetchDTM,
  } = useQuery({
    queryKey: ['dtm'],
    queryFn: () => getDTMQuota(getValues()?.location.x, getValues()?.location.y),
    refetchOnWindowFocus: false,
    enabled: false,
  });

  useEffect(() => {
    if (isSuccess && DTMData.HentKoterRespons.data[0].kote !== null) {
      setValue('location.terrainlevel', Number(DTMData.HentKoterRespons.data[0].kote.toFixed(3)));
    }
  }, [DTMData]);

  const {watch, control, setValue, getValues, reset} = useFormContext();

  const watchTerrainqual = watch('location.terrainqual', '');

  console.log(getValues());
  if (mode === 'modal' && getValues().location && getValues().location.loc_id)
    reset({
      location: stamdataStore().location,
      timeseries: getValues().timeseries,
      unit: getValues().unit,
    });

  const gridsize = mode === 'modal' ? 12 : 6;
  const superUser = authStore().superUser;

  return (
    // <FormProvider {...formMethods}>
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={gridsize}>
        <FormInput
          name="location.loc_name"
          label="Navn"
          required
          fullWidth
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
        <Controller
          name="location.groups"
          control={control}
          render={({field: {onChange, value}}) => (
            <LocationGroups value={value} setValue={onChange} disable={disable} />
          )}
        />
      </Grid>
      {superUser && mode !== 'normal' && getValues().location && !getValues().location.loc_id && (
        <Grid item xs={12} sm={gridsize}>
          <Controller
            name="location.initial_project_no"
            control={control}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <LocationProjects value={value} setValue={onChange} error={error} disable={disable} />
            )}
          />
        </Grid>
      )}
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
          onChangeCallback={() => {
            if (watchTerrainqual === 'DTM') {
              refetchDTM();
            }
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
          onChangeCallback={() => {
            if (watchTerrainqual === 'DTM') {
              refetchDTM();
            }
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
      <Grid item xs={6} sm={gridsize / 2} md={gridsize / 2}>
        <FormInput
          name="location.terrainqual"
          label="Type af terrænkote"
          select
          fullWidth
          sx={{
            mb: 2,
          }}
          disabled={disable}
          onChangeCallback={(e) => {
            if (e.target.value === 'DTM') {
              refetchDTM();
            }
          }}
        >
          <MenuItem value=""> Vælg type </MenuItem>
          <MenuItem value="dGPS">dGPS</MenuItem>
          <MenuItem value="DTM">DTM</MenuItem>
        </FormInput>
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
