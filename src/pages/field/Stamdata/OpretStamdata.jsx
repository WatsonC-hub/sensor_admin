import {Container, Grid, TextField, Typography, Box, Tabs, Tab, Divider} from '@mui/material';
import Button from '~/components/Button';
import Autocomplete from '@mui/material/Autocomplete';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {apiClient} from '~/apiClient';
import AddLocationForm from './AddLocationForm';
import AddUnitForm from './AddUnitForm';
import LocationForm from './components/LocationForm';
import TimeseriesForm from './components/TimeseriesForm';
import UnitForm from './components/UnitForm';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import {zodResolver} from '@hookform/resolvers/zod';
import SaveIcon from '@mui/icons-material/Save';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import {FormProvider, useForm, useFormContext} from 'react-hook-form';
import {toast} from 'react-toastify';
import {metadataSchema} from '~/helpers/zodSchemas';
import NavBar from '~/components/NavBar';
import {stamdataStore} from '../../../state/store';

import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';

function LocationChooser({setLocationDialogOpen}) {
  const location = stamdataStore((store) => store.location);
  const [selectedLoc, setSelectedLoc] = useState(location.loc_id ? location : {loc_name: ''});
  const formMethods = useFormContext();

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  const populateFormData = (locData) => {
    setSelectedLoc(locData);
    if (locData) {
      formMethods.reset({
        location: {
          loc_id: locData.loc_id,
          loc_name: locData.loc_name,
          mainloc: locData.mainloc,
          subloc: locData.subloc,
          subsubloc: locData.subsubloc,
          groups: locData.groups,
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
          groups: [],
          terrainqual: '',
          terrainlevel: '',
          description: '',
          loctype_id: '',
        },
      });
    }
  };

  const {data: locations} = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const {data} = await apiClient.get('/sensor_field/stamdata/locations');
      return data;
    },
  });

  const desktopChooser = (
    <>
      <Grid item xs={12} sm={6}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'start',
          }}
        >
          <Typography>Lokation</Typography>

          <Autocomplete
            value={selectedLoc}
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
            onChange={(event, value) => {
              populateFormData(value);
            }}
          />

          <Button
            size="small"
            color="primary"
            variant="contained"
            sx={{
              textTransform: 'none',
              ml: '12px',
            }}
            onClick={() => setLocationDialogOpen(true)}
          >
            Tilføj ny lokation
          </Button>
        </Box>
      </Grid>
      {/* <Grid item xs={12} sm={6}></Grid> */}
    </>
  );

  const mobileChooser = (
    <>
      <Grid item xs={12}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'start',
          }}
        >
          <Autocomplete
            value={selectedLoc}
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
            disableClearable
            style={{width: 200}}
            onChange={(event, value) => populateFormData(value)}
          />
          <Button
            btType="primary"
            size="small"
            sx={{
              ml: 1,
            }}
            startIcon={<AddLocationAltIcon />}
            onClick={() => setLocationDialogOpen(true)}
          >
            Tilføj lokation
          </Button>
        </Box>
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

function TabPanel(props) {
  const {children, value, index, ...other} = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={1}>{children}</Box>}
    </div>
  );
}

export default function OpretStamdata({setAddStationDisabled}) {
  const navigate = useNavigate();
  const store = stamdataStore();
  const [udstyrDialogOpen, setUdstyrDialogOpen] = React.useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = React.useState(
    store.location.x ? (store.location.loc_id ? false : true) : false
  );
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    return () => {
      store.resetLocation();
      store.resetTimeseries();
      store.resetUnit();
    };
  }, []);

  const formMethods = useForm({
    resolver: zodResolver(metadataSchema),
    defaultValues: {
      location: {
        ...store.location,
      },
      timeseries: {
        tstype_id: -1,
      },
    },
    mode: 'onTouched'
  });

  const {
    formState: {isSubmitting, errors},
    reset,
    watch,
    getValues,
    handleSubmit,
    trigger,
  } = formMethods;

  const watchtstype_id = watch('timeseries.tstype_id');

  const stamdataNewMutation = useMutation({
    mutationFn: async (data) => {
      const {data: out} = await apiClient.post(`/sensor_field/stamdata/`, data);
      return out;
    },
  });

  useEffect(() => {
    store.resetUnit();
    reset((formValues) => {
      return {
        ...formValues,
        unit: {
          startdate: '',
          unit_uuid: '',
        },
      };
    });
  }, [watchtstype_id]);

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

  console.log('errors', errors);
  console.log('values', getValues());

  return (
    <>
      <NavBar />
      <div>
        <FormProvider {...formMethods}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="fullWidth"
            aria-label="simple tabs example"
            sx={{
              '& .MuiTab-root': {
                height: '48px',
                minHeight: '48px',
              },
            }}
          >
            <Tab
              label="Lokation"
              iconPosition="start"
              icon={errors?.location ? <ErrorOutlineIcon color="error" /> : null}
            />
            <Tab
              iconPosition="start"
              label="Tidsserie"
              icon={
                errors?.timeseries || errors?.watlevmp ? <ErrorOutlineIcon color="error" /> : null
              }
            />
            <Tab label="Udstyr" icon={errors?.unit ? <ErrorOutlineIcon color="error" /> : null} />
          </Tabs>
          <Divider />
          <Box
            display="flex"
            flexDirection="column"
            sx={{
              maxWidth: '1200px',
              margin: 'auto',
            }}
          >
            {/* <Typography variant="h6" component="h3">
              Stamdata
            </Typography> */}
            <TabPanel value={tabValue} index={0}>
              <Location setLocationDialogOpen={setLocationDialogOpen} />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {/* <Typography>Tidsserie</Typography> */}
              <TimeseriesForm mode="add" />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              {/* <Typography>Udstyr</Typography> */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'start',
                }}
              >
                <Button
                  disabled={watchtstype_id === -1}
                  btType="primary"
                  size="small"
                  sx={{
                    ml: 1,
                  }}
                  onClick={() => setUdstyrDialogOpen(true)}
                >
                  {store.unit.calypso_id === '' ? 'Tilføj Udstyr' : 'Ændre udstyr'}
                </Button>
                {errors?.unit && (
                  <Typography variant="caption" color="error">
                    Vælg udstyr først
                  </Typography>
                )}
              </Box>
              <UnitForm mode="add" />
            </TabPanel>

            <Box display="flex" gap={1} justifyContent="flex-end" justifySelf="end">
              <Button
                btType="tertiary"
                onClick={() => {
                  navigate('/field');
                  setAddStationDisabled(false);
                }}
              >
                Annuller
              </Button>

              {tabValue < 2 && (
                <Button
                  btType="primary"
                  onClick={() => {
                    setTabValue((prev) => prev + 1);
                  }}
                >
                  Næste
                </Button>
              )}
              {tabValue == 2 && (
                <Button
                  btType="primary"
                  onClick={handleSubmit(handleOpret, handleDebug)}
                  startIcon={<SaveIcon />}
                  disabled={isSubmitting}
                >
                  Gem
                </Button>
              )}
            </Box>
          </Box>
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
    </>
  );
}
