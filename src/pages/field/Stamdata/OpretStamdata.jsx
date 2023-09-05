import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Container, Grid, Typography, Button, TextField} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import 'date-fns';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useTheme} from '@mui/material/styles';
import AddUnitForm from './AddUnitForm';
import AddLocationForm from './AddLocationForm';
import LocationForm from './components/LocationForm';
import TimeseriesForm from './components/TimeseriesForm';
import {apiClient} from 'src/apiClient';
import UnitForm from './components/UnitForm';
import {DevTool} from '@hookform/devtools';

import SaveIcon from '@mui/icons-material/Save';
import moment from 'moment';
import {stamdataStore} from '../../../state/store';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {metadataSchema} from 'src/helpers/zodSchemas';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm, FormProvider, useFormContext} from 'react-hook-form';
import {toast} from 'react-toastify';

const flex1 = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'start',
};

function LocationChooser({setLocationDialogOpen}) {
  const [setLocation, resetLocation] = stamdataStore((store) => [
    store.setLocation,
    store.resetLocation,
  ]);

  const formMethods = useFormContext();

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  const populateFormData = (locData) => {
    if (locData) {
      formMethods.reset({
        location: {
          loc_id: locData.loc_id,
          loc_name: locData.loc_name,
          mainloc: locData.mainloc,
          subloc: locData.subloc,
          subsubloc: locData.subsubloc,
          x: locData.x,
          y: locData.y,
          terrainqual: locData.terrainqual,
          terrainlevel: locData.terrainlevel,
          description: locData.description,
          loctype_id: locData.loctype_id,
        },
      });
    } else {
      formMethods.reset({
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
          loctype_id: '',
        },
      });
    }
  };

  const {data: locations} = useQuery(['locations'], async () => {
    const {data} = await apiClient.get('/sensor_field/stamdata/locations');
    return data;
  });

  const desktopChooser = (
    <>
      <Grid item xs={12} sm={6}>
        <div style={flex1}>
          <Typography>Lokation</Typography>

          <Autocomplete
            options={locations ? locations : []}
            getOptionLabel={(option) => option.loc_name}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                variant="outlined"
                placeholder="Vælg lokalitet"
                style={{marginTop: '-6px'}}
              />
            )}
            style={{width: 200, marginLeft: '12px'}}
            onChange={(event, value) => populateFormData(value)}
          />

          <Button
            size="small"
            color="secondary"
            variant="contained"
            style={{
              textTransform: 'none',
              marginLeft: '12px',
            }}
            onClick={() => setLocationDialogOpen(true)}
          >
            Tilføj ny lokation
          </Button>
        </div>
      </Grid>
      {/* <Grid item xs={12} sm={6}></Grid> */}
    </>
  );

  const mobileChooser = (
    <>
      <Grid item xs={12}>
        <div style={flex1}>
          <Autocomplete
            options={locations}
            getOptionLabel={(option) => option.loc_name}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                variant="outlined"
                placeholder="Vælg lokalitet"
                style={{marginTop: '-6px'}}
              />
            )}
            disableClearable
            style={{width: 200}}
            onChange={(event, value) => populateFormData(value)}
          />
          <Button
            color="secondary"
            variant="contained"
            style={{
              textTransform: 'none',
            }}
            onClick={() => setLocationDialogOpen(true)}
          >
            Tilføj lokation
          </Button>
        </div>
      </Grid>
    </>
  );

  return matches ? mobileChooser : desktopChooser;
}

function Location({setLocationDialogOpen}) {
  return (
    <Grid container>
      <LocationChooser setLocationDialogOpen={setLocationDialogOpen} />
      <LocationForm disable />
    </Grid>
  );
}

export default function OpretStamdata({setAddStationDisabled}) {
  const navigate = useNavigate();
  const store = stamdataStore();
  const [udstyrDialogOpen, setUdstyrDialogOpen] = React.useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = React.useState(store.location.x ? true : false);

  
  const queryClient = useQueryClient();

  useEffect(() => {
    return () => {
      store.resetUnit();
    };
  }, []);

  const formMethods = useForm({
    resolver: zodResolver(metadataSchema),
    defaultValues: {
      location: {
        loc_name: '',
        terrainqual: '',
        loctype_id: -1,
        x: store.location.x,
        y: store.location.y,
      },
      timeseries: {
        tstype_id: -1,
      },
    },
  });

  const {
    formState: {errors, isSubmitSuccessful, values, isSubmitting},
    reset,
    watch,
    getValues,
    handleSubmit,
    control,
  } = formMethods;

  const [selectedStationType, setSelectedStationType] = useState(-1);

  const stamdataNewMutation = useMutation(async (data) => {
    const {data: out} = await apiClient.post(`/sensor_field/stamdata/`, data);
    return out;
  });

  const handleDebug = (error) => {
    console.log('values', getValues());
    console.log('error', error);
  };

  const handleOpret = async () => {
    setAddStationDisabled(false);
    let form = {
      location: {
        ...getValues()?.location,
      },
      timeseries: {
        ...getValues()?.timeseries,
      },
      unit: {
        startdate: store.unit.startdato,
        unit_uuid: store.unit.uuid,
      },
    };

    if (getValues()?.timeseries.tstype_id === 1) {
      form['watlevmp'] = {
        startdate: moment(store.unit.startdato).format('YYYY-MM-DD'),
        ...getValues()?.watlevmp,
      };
    }

    try {
      await toast.promise(() => stamdataNewMutation.mutateAsync(form), {
        pending: 'Opretter stamdata...',
        success: 'Stamdata oprettet!',
        error: 'Noget gik galt!',
      });
      navigate(`/field`);
    } catch (e) {
      console.log(e);
    }
  };

  const watchtstype_id = watch('timeseries.tstype_id');

  return (
    <div>
      <FormProvider {...formMethods}>
        <Container fixed>
          <Typography variant="h6" component="h3">
            Stamdata
          </Typography>

          <Location setLocationDialogOpen={setLocationDialogOpen} />
          <Typography>Tidsserie</Typography>
          <TimeseriesForm mode="add" />
          <div style={flex1}>
            <Typography>Udstyr</Typography>
            <Button
              disabled={watchtstype_id === -1}
              size="small"
              style={{
                textTransform: 'none',
                marginLeft: '12px',
              }}
              color="secondary"
              variant="contained"
              onClick={() => setUdstyrDialogOpen(true)}
            >
              {store.unit.calypso_id === '' ? 'Tilføj Udstyr' : 'Ændre udstyr'}
            </Button>
          </div>
          <UnitForm mode="add" />
          <Grid container spacing={3}>
            <Grid item xs={4} sm={2}>
              <Button
                color="secondary"
                variant="contained"
                onClick={handleSubmit(handleOpret, handleDebug)}
                startIcon={<SaveIcon />}
                disabled={isSubmitting}
              >
                Gem
              </Button>
            </Grid>
            <Grid item xs={4} sm={2}>
              <Button
                color="grey"
                variant="contained"
                onClick={() => {
                  navigate('/field');
                  setAddStationDisabled(false);
                }}
              >
                Annuller
              </Button>
            </Grid>
          </Grid>
        </Container>
        <AddUnitForm
          udstyrDialogOpen={udstyrDialogOpen}
          setUdstyrDialogOpen={setUdstyrDialogOpen}
          tstype_id={watchtstype_id}
        />
        <AddLocationForm
          locationDialogOpen={locationDialogOpen}
          setLocationDialogOpen={setLocationDialogOpen}
          formMethods={formMethods}
        />
        {/* <DevTool control={control} /> */}
      </FormProvider>
    </div>
  );
}
