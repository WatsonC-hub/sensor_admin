import {DevTool} from '@hookform/devtools';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  BuildRounded,
  LocationOnRounded,
  SettingsPhoneRounded,
  ShowChartRounded,
} from '@mui/icons-material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import {Grid, TextField, Typography, Box, Tabs, Tab, Divider} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useMutation, useQuery} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {FormProvider, useForm, useFormContext} from 'react-hook-form';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import NavBar from '~/components/NavBar';
import {tabsHeight} from '~/consts';
import {metadataSchema} from '~/helpers/zodSchemas';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useSearchParam} from '~/hooks/useSeachParam';

import {stamdataStore} from '../../../state/store';

import AddLocationForm from './AddLocationForm';
import AddUnitForm from './AddUnitForm';
import KontaktForm from './components/KontaktForm';
import LocationForm from './components/LocationForm';
import TimeseriesForm from './components/TimeseriesForm';
import UnitForm from './components/UnitForm';

function LocationChooser({setLocationDialogOpen}) {
  const location = stamdataStore((store) => store.location);
  const [selectedLoc, setSelectedLoc] = useState(location.loc_id ? location : null);
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
            bttype="primary"
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
            flexDirection: 'column',
            alignItems: 'end',
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
            style={{width: '100%', margin: '0 auto'}}
            onChange={(event, value) => populateFormData(value)}
          />
          <Button
            bttype="primary"
            size="small"
            sx={{
              ml: 1,
            }}
            startIcon={<AddLocationAltIcon />}
            onClick={() => setLocationDialogOpen(true)}
          >
            Opret lokalitet
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
  const {field} = useNavigationFunctions();
  const store = stamdataStore();
  const [udstyrDialogOpen, setUdstyrDialogOpen] = React.useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = React.useState(
    store.location.x ? (store.location.loc_id ? false : true) : false
  );
  // const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    return () => {
      store.resetLocation();
      store.resetTimeseries();
      store.resetUnit();
    };
  }, []);

  const [tabValue, setTabValue] = useSearchParam('tab', '0');

  console.log('tabValue', tabValue, typeof tabValue);

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
    mode: 'onTouched',
  });

  const {
    formState: {isSubmitting, errors},
    reset,
    watch,
    getValues,
    handleSubmit,
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

    console.log(formMethods.getValues());

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

      // navigate('/field');
      field();
    } catch (e) {
      console.log(e);
    }
  };

  // useEffect(() => {
  //   setTabValue('0');
  //   return () => {
  //     setTabValue(null);
  //   };
  // }, []);

  return (
    <>
      <NavBar />
      <div>
        <FormProvider {...formMethods}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => {
              setTabValue(newValue);
            }}
            variant="fullWidth"
            aria-label="simple tabs example"
            sx={{
              '& .MuiTab-root': {
                height: tabsHeight,
                minHeight: tabsHeight,
                marginTop: 1,
              },
            }}
          >
            <Tab
              value="0"
              icon={<LocationOnRounded sx={{marginTop: 1}} fontSize="small" />}
              label={
                <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
                  Lokalitet
                </Typography>
              }
            />

            <Tab
              value="1"
              icon={<SettingsPhoneRounded sx={{marginTop: 1}} fontSize="small" />}
              label={
                <Typography variant={'body2'} marginBottom={1} textTransform={'capitalize'}>
                  Kontakt
                </Typography>
              }
            />
            <Tab
              value="2"
              icon={<ShowChartRounded sx={{marginTop: 1}} fontSize="small" />}
              label={
                <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
                  Tidsserie
                </Typography>
              }
            />
            <Tab
              value="3"
              icon={<BuildRounded sx={{marginTop: 1}} fontSize="small" />}
              label={
                <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
                  Udstyr
                </Typography>
              }
            />
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
            <TabPanel value={tabValue} index={'0'}>
              <Location setLocationDialogOpen={setLocationDialogOpen} />
            </TabPanel>
            <TabPanel value={tabValue} index={'1'}>
              <KontaktForm />
            </TabPanel>
            <TabPanel value={tabValue} index={'2'}>
              {/* <Typography>Tidsserie</Typography> */}
              <TimeseriesForm mode="add" />
            </TabPanel>
            <TabPanel value={tabValue} index={'3'}>
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
                  bttype="primary"
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
            <footer style={{position: 'sticky', bottom: 0, float: 'right'}}>
              <Box display="flex" gap={1} justifyContent="flex-end" justifySelf="end">
                <Button
                  bttype="tertiary"
                  onClick={() => {
                    // navigate('/field');
                    field();
                    setAddStationDisabled(false);
                  }}
                >
                  Annuller
                </Button>

                {tabValue < 3 && (
                  <Button
                    bttype="primary"
                    sx={{marginRight: 1}}
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    onClick={() => {
                      setTabValue((parseInt(tabValue) + 1).toString());
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      Videre
                    </Box>
                  </Button>
                )}
                {tabValue == 3 && (
                  <Button
                    bttype="primary"
                    onClick={handleSubmit(handleOpret, handleDebug)}
                    startIcon={<SaveIcon />}
                    sx={{marginRight: 1}}
                    disabled={isSubmitting}
                  >
                    Gem
                  </Button>
                )}
              </Box>
            </footer>
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
          <DevTool control={formMethods.control} />
        </FormProvider>
      </div>
    </>
  );
}
