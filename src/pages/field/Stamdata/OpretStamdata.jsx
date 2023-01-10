import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Container, Grid, Typography, Button, TextField} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import 'date-fns';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useTheme} from '@mui/material/styles';
import AddUdstyrForm from './AddUdstyrForm';
import AddLocationForm from './AddLocationForm';
import LocationForm from './components/LocationForm';
import StationForm from './components/StationForm';
import {apiClient, postStamdata} from '../fieldAPI';
import UdstyrForm from './components/UdstyrForm';

import SaveIcon from '@mui/icons-material/Save';
import moment from 'moment';
import {stamdataStore} from '../../../state/store';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import axios from 'axios';

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

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  const populateFormData = (locData) => {
    if (locData) {
      setLocation({
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
      });
    } else {
      resetLocation();
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
      <LocationForm />
    </Grid>
  );
}

export default function OpretStamdata({setAddStationDisabled}) {
  const navigate = useNavigate();
  const [udstyrDialogOpen, setUdstyrDialogOpen] = React.useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = React.useState(false);

  const store = stamdataStore();
  const queryClient = useQueryClient();

  const [selectedStationType, setSelectedStationType] = useState(-1);

  const stamdataMutation = useMutation(postStamdata, {
    onSuccess: (data) => {
      navigate('/');
      queryClient.invalidateQueries('station_list');
      queryClient.invalidateQueries('map_data');
    },
  });

  const changeSelectedStationType = (selectedType) => {
    if (selectedType !== selectedStationType) {
      store.resetUnit();
    }
    setSelectedStationType(selectedType);
  };

  const handleSubmit = () => {
    setAddStationDisabled(false);
    let form = {
      location: {
        ...store.location,
      },
      station: {
        ...store.timeseries,
        mpstartdate: moment(store.unit.startdato).format('YYYY-MM-DD'),
      },
      udstyr: {
        ...store.unit,
      },
    };

    toast.promise(() => stamdataMutation.mutateAsync(form), {
      pending: 'Opretter station',
      success: 'Stationen er oprettet',
      error: 'Der skete en fejl',
    });
  };

  return (
    <div>
      <AddUdstyrForm
        udstyrDialogOpen={udstyrDialogOpen}
        setUdstyrDialogOpen={setUdstyrDialogOpen}
        tstype_id={selectedStationType}
      />
      <AddLocationForm
        locationDialogOpen={locationDialogOpen}
        setLocationDialogOpen={setLocationDialogOpen}
      />
      <Container fixed>
        <Typography variant="h6" component="h3">
          Stamdata
        </Typography>

        <Location setLocationDialogOpen={setLocationDialogOpen} />
        <Typography>Station</Typography>
        <StationForm
          mode="add"
          selectedStationType={selectedStationType}
          setSelectedStationType={changeSelectedStationType}
        />
        <div style={flex1}>
          <Typography>Udstyr</Typography>
          <Button
            disabled={selectedStationType === -1}
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
        <UdstyrForm mode="add" />
        <Grid container spacing={3}>
          <Grid item xs={4} sm={2}>
            <Button
              color="secondary"
              variant="contained"
              onClick={handleSubmit}
              startIcon={<SaveIcon />}
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
    </div>
  );
}
