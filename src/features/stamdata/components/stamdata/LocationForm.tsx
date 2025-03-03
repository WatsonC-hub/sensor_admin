import {Grid, InputAdornment, MenuItem} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {ChangeEvent, useEffect} from 'react';
import {useFormContext, Controller} from 'react-hook-form';

import FormInput from '~/components/FormInput';
import {useUser} from '~/features/auth/useUser';
import LocationGroups from '~/features/stamdata/components/stamdata/LocationGroups';
import LocationProjects from '~/features/stamdata/components/stamdata/LocationProjects';
import LocationTypeSelect from '~/features/stamdata/components/stamdata/LocationTypeSelect';
import {getDTMQuota} from '~/pages/field/fieldAPI';

interface Props {
  mode: 'modal' | 'normal';
  disable?: boolean;
}

export default function LocationForm({mode, disable = false}: Props) {
  const {watch, control, setValue, getValues} = useFormContext();

  const {
    data: DTMData,
    isSuccess,
    refetch: refetchDTM,
  } = useQuery({
    queryKey: ['dtm'],
    queryFn: () => getDTMQuota(getValues('location.x'), getValues('location.y')),
    refetchOnWindowFocus: false,
    enabled:
      !disable && getValues('location.x') !== undefined && getValues('location.y') !== undefined,
  });

  useEffect(() => {
    if (isSuccess && DTMData.HentKoterRespons.data[0].kote !== null) {
      setValue('location.terrainlevel', Number(DTMData.HentKoterRespons.data[0].kote.toFixed(3)));
    }
  }, [DTMData]);

  const watchTerrainqual = watch('location.terrainqual', '');

  const gridsize = mode === 'modal' ? 12 : 6;
  const user = useUser();

  console.log(getValues().unit);

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={gridsize}>
        <FormInput
          name="location.loc_name"
          label="Navn"
          required
          fullWidth
          placeholder="f.eks. Engsø"
          disabled={disable}
        />
      </Grid>
      <Grid item xs={12} sm={gridsize}>
        <FormInput
          name="location.mainloc"
          label="Hoved lokation"
          fullWidth
          placeholder="f.eks. Aarhus Kommune"
          disabled={disable}
        />
      </Grid>
      <Grid item xs={12} sm={gridsize}>
        <Controller
          name="location.groups"
          control={control}
          render={({field: {onChange, value, onBlur}}) => (
            <LocationGroups value={value} setValue={onChange} onBlur={onBlur} disable={disable} />
          )}
        />
      </Grid>
      {user?.superUser && (
        <>
          <Grid item xs={12} sm={gridsize}>
            <Controller
              name="location.initial_project_no"
              control={control}
              render={({field: {onChange, value, onBlur}, fieldState: {error}}) => (
                <LocationProjects
                  value={value}
                  setValue={onChange}
                  onBlur={onBlur}
                  error={error}
                  disable={
                    disable ||
                    (getValues().unit !== undefined &&
                      getValues('unit').unit_uuid !== '' &&
                      getValues().unit.unit_uuid !== null &&
                      getValues().unit.unit_uuid !== undefined)
                  }
                />
              )}
            />
          </Grid>
        </>
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
          InputProps={{endAdornment: <InputAdornment position="start">m</InputAdornment>}}
          fullWidth
          disabled={disable}
        />
      </Grid>
      <Grid item xs={6} sm={gridsize / 2} md={gridsize / 2}>
        <FormInput
          name="location.terrainqual"
          label="Type af terrænkote"
          select
          fullWidth
          disabled={disable}
          onChangeCallback={(e) => {
            if ((e as ChangeEvent<HTMLTextAreaElement>).target.value === 'DTM') {
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
          disabled={disable}
          placeholder="f.eks. ligger tæt ved broen"
        />
      </Grid>
    </Grid>
  );
}
