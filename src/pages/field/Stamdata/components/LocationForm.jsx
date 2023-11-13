import {Autocomplete, Button, Grid, InputAdornment, MenuItem, TextField} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import FormInput from 'src/components/FormInput';
import {apiClient} from '../../../../apiClient';
import {postElasticSearch} from '../../boreholeAPI';
import {getDTMQuota} from '../../fieldAPI';
import LocationTypeSelect from './LocationTypeSelect';

export default function LocationForm({mode, disable}) {
  const [locItems, setLocItems] = React.useState([]);
  const [boreholeData, setBoreholeData] = React.useState([]);
  const [intake, setIntake] = React.useState('');
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
  const watchLoctype = watch('location.loctype_id', '');

  const gridsize = mode === 'modal' ? 12 : 6;

  const elasticSearch = (e, value, reason) => {
    const search_string = value;
    if (reason == 'clear') {
      setLocItems([]);
      setBoreholeData([]);
      return;
    }

    if (search_string) {
      let search = {
        query: {
          bool: {
            must: {
              query_string: {},
            },
          },
        },
      };

      search.query.bool.must.query_string.query = search_string;
      postElasticSearch(search).then((res) => {
        const filteredBorehole = res.data.hits.hits.map((elem) => {
          return {name: elem._source.properties.boreholeno, group: 'Jupiter'};
        });
        setLocItems(filteredBorehole);
      });
    }
  };

  const handleBoreholeChange = (e, value) => {
    if (!value) {
      setIntake('');
      reset({
        location: {
          loc_name: '',
          mainloc: '',
          subloc: '',
          subsubloc: '',
          x: '',
          y: '',
          terrainqual: '',
          terrainlevel: '',
          description: '',
          loctype_id: 9,
        },
      });
      return;
    }
    console.log(value);
    apiClient.get(`/sensor_field/stamdata/dgu/${value.name}`).then((res) => {
      const data = res.data;
      setIntake('');
      setBoreholeData(data);
    });
  };

  const handleIntakeChange = (e) => {
    const value = e.target.value;
    setIntake(value);
    const data = boreholeData.filter((elem) => elem.intakeno === value)[0];
    console.log(boreholeData);
    console.log(data);
    reset({
      location: {
        loc_name: data.loc_name,
        mainloc: data.mainloc,
        x: data.x,
        y: data.y,
        terrainqual: data.terrainqual,
        terrainlevel: data.terrainlevel,
        description: data.description,
        loctype_id: 9,
      },
      timeseries: {
        prefix: data.intakeno,
      },
    });
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={gridsize}>
        <LocationTypeSelect disable={disable || watchLoctype == 9} />
      </Grid>
      {watchLoctype == 9 && mode == 'modal' && (
        <>
          <Grid item xs={12} sm={gridsize}>
            <Autocomplete
              freeSolo={true}
              forcePopupIcon={false}
              options={locItems}
              getOptionLabel={(option) => (option?.name ? option.name : option)}
              groupBy={(option) => option.group}
              renderInput={(params) => (
                <TextField
                  {...params}
                  // size="small"
                  label="DGU nr."
                  variant="outlined"
                  placeholder="Søg efter dgu boring..."
                />
              )}
              fullWidth
              onChange={handleBoreholeChange}
              onInputChange={elasticSearch}
            />
          </Grid>
          <Grid item xs={12} sm={gridsize}>
            <TextField value={intake} select fullWidth label="Indtag" onChange={handleIntakeChange}>
              {boreholeData.map((elem) => (
                <MenuItem key={elem.intakeno} value={elem.intakeno}>
                  {elem.intakeno}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </>
      )}
      {(mode != 'modal' || watchLoctype != 9) && (
        <>
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
              disabled={disable || watchLoctype == 9}
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
