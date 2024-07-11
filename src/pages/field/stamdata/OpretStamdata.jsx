import {DevTool} from '@hookform/devtools';
import {zodResolver} from '@hookform/resolvers/zod';
import {BuildRounded, LocationOnRounded, ShowChartRounded} from '@mui/icons-material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
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
import {stamdataStore} from '~/state/store';

import AddLocationForm from './AddLocationForm';
import AddUnitForm from './AddUnitForm';
import LocationForm from './components/LocationForm';
import StamdataFooter from './components/StamdataFooter';
import TimeseriesForm from './components/TimeseriesForm';
import UnitForm from './components/UnitForm';

function LocationChooser({setLocationDialogOpen}) {
  const loc_id = stamdataStore((store) => store.location.loc_id);
  const [selectedLoc, setSelectedLoc] = useState(null);
  console.log(selectedLoc);
  const formMethods = useFormContext();
  const {data: locations} = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const {data} = await apiClient.get('/sensor_field/stamdata/locations');
      return data;
    },
  });

  useEffect(() => {
    if (loc_id != undefined && locations != undefined) {
      populateFormData(locations.find((item) => item.loc_id === loc_id));
    }
  }, [loc_id, locations]);

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
          projectno: locData.initial_project_no,
        },
      });
    } else {
      formMethods.reset({
        location: {
          loc_name: '',
          mainloc: '',
          subloc: '',
          subsubloc: '',
          x: 0,
          y: 0,
          groups: [],
          terrainqual: '',
          terrainlevel: 0,
          description: '',
          loctype_id: -1,
          projectno: '',
        },
      });
    }
  };

  const locationSelector = (
    <>
      <Grid item xs={matches ? 12 : 6} md={6} sm={matches ? 6 : 12}>
        <Box
          sx={
            matches
              ? {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'end',
                  justifyContent: 'start',
                }
              : {
                  display: 'flex',
                  alignItems: 'center',
                  align: 'center',
                  justifyContent: 'start',
                }
          }
        >
          {matches ? '' : <Typography>Lokation</Typography>}

          <Autocomplete
            value={selectedLoc}
            options={locations ? locations : []}
            getOptionLabel={(option) => option.loc_name}
            isOptionEqualToValue={(option, value) => option.loc_name === value.loc_name}
            renderInput={(params) => (
              <TextField {...params} size="small" variant="outlined" placeholder="Vælg lokalitet" />
            )}
            disableClearable={matches}
            style={matches ? {width: '100%'} : {width: 200, marginLeft: '12px'}}
            onChange={(event, value) => {
              populateFormData(value);
            }}
          />

          <Button
            size="small"
            color="primary"
            bttype="primary"
            sx={matches ? {ml: 1} : {textTransform: 'none', ml: '12px'}}
            startIcon={<AddLocationAltIcon />}
            onClick={() => setLocationDialogOpen(true)}
          >
            Opret lokalitet
          </Button>
        </Box>
      </Grid>
    </>
  );

  return locationSelector;
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
  useEffect(() => {
    return () => {
      store.resetLocation();
      store.resetTimeseries();
      store.resetUnit();
    };
  }, []);

  const [tabValue, setTabValue] = useSearchParam('tab', '0');

  const formMethods = useForm({
    resolver: zodResolver(metadataSchema),
    defaultValues: {
      location: {
        ...store.location,
        // projectno: superUser ? '' : null,
      },
      timeseries: {
        tstype_id: -1,
      },
    },
    mode: 'onTouched',
  });

  const {
    formState: {errors},
    reset,
    watch,
    getValues,
    trigger,
  } = formMethods;

  console.log(getValues());
  const watchtstype_id = watch('timeseries.tstype_id');

  const stamdataNewMutation = useMutation({
    mutationFn: async (data) => {
      const {data: out} = await apiClient.post(`/sensor_field/stamdata/`, data);
      return out;
    },
  });

  const stamdataNewLocationMutation = useMutation({
    mutationFn: async (data) => {
      const {data: out} = await apiClient.post(
        `/sensor_field/stamdata/create_location`,
        data.location
      );
      return out;
    },
  });

  const stamdataNewTimeseriesMutation = useMutation({
    mutationFn: async (data) => {
      const {data: out} = await apiClient.post(`/sensor_field/stamdata/create_timeseries`, data);
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

  const cancel = () => {
    field();
    setAddStationDisabled(false);
  };

  const nextTab = () => {
    if (tabValue !== '3') setTabValue((parseInt(tabValue) + 1).toString());
  };

  useEffect(() => {
    if (tabValue === null && getValues().location.loc_id) setTabValue('1');
  }, [tabValue]);

  const handleLocationOpret = async () => {
    const locationValid = await trigger('location');
    if (locationValid) {
      const location = {
        location: {
          ...getValues().location,
          initial_project_no: getValues().location.projectno,
        },
      };

      await toast.promise(() => stamdataNewLocationMutation.mutateAsync(location), {
        pending: 'Opretter lokation...',
        success: 'lokation oprettet!',
        error: 'Noget gik galt!',
      });
    }
  };

  const handleTimeseriesOpret = async () => {
    const locationValid = await trigger('location');
    const timeseriesValid = await trigger('timeseries');

    let form = null;
    if (locationValid && timeseriesValid) {
      form = {
        location: {
          ...getValues().location,
          initial_project_no: getValues().location.projectno,
        },
        timeseries: {
          ...getValues().timeseries,
        },
      };

      if (getValues()?.timeseries.tstype_id === 1 && form['unit']) {
        form['watlevmp'] = {
          startdate: moment(store.unit.startdato).format('YYYY-MM-DD'),
          ...getValues()?.watlevmp,
        };
      } else {
        form['watlevmp'] = {
          startdate: moment().format('YYYY-MM-DD'),
          ...getValues()?.watlevmp,
        };
      }

      let text = 'lokation og tidsserie';
      if (!form.location.loc_id) text = 'tidsserie';

      await toast.promise(() => stamdataNewTimeseriesMutation.mutateAsync(form), {
        pending: 'Opretter ' + text + '' + '...',
        success: text + ' oprettet!',
        error: 'Noget gik galt!',
      });
    }
  };

  const handleUnitOpret = async () => {
    const locationValid = await trigger('location');
    const timeseriesValid = await trigger('timeseries');

    let form = null;
    if (locationValid && timeseriesValid) {
      form = {
        location: {
          ...getValues().location,
          initial_project_no: getValues().location.projectno,
        },
        timeseries: {
          ...getValues().timeseries,
        },
        unit: {
          startdate: store.unit.startdato,
          unit_uuid: store.unit.uuid,
        },
      };

      console.log(form);
      if (getValues()?.timeseries.tstype_id === 1 && form['unit']) {
        form['watlevmp'] = {
          startdate: moment(store.unit.startdato).format('YYYY-MM-DD'),
          ...getValues()?.watlevmp,
        };
      }

      let text = 'lokation, tidsserie og udstyr';
      if (!form.location.loc_id) text = 'udstyr';

      await toast.promise(() => stamdataNewMutation.mutateAsync(form), {
        pending: 'Opretter ' + text + '' + '...',
        success: text + ' oprettet!',
        error: 'Noget gik galt!',
      });
    }
  };

  return (
    <>
      <NavBar />
      <div>
        <FormProvider {...formMethods}>
          <Tabs
            value={tabValue !== null ? tabValue : '0'}
            onChange={(_, newValue) => {
              console.log(newValue);
              console.log(tabValue);

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
              icon={<ShowChartRounded sx={{marginTop: 1}} fontSize="small" />}
              label={
                <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
                  Tidsserie
                </Typography>
              }
            />
            <Tab
              value="2"
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
            <TabPanel value={tabValue} index={'0'}>
              <Location setLocationDialogOpen={setLocationDialogOpen} />
              <StamdataFooter
                cancel={cancel}
                nextTab={nextTab}
                disabled={getValues().location.loc_id !== undefined}
                handleOpret={handleLocationOpret}
                type="lokalitet"
              />
            </TabPanel>
            <TabPanel value={tabValue} index={'1'}>
              <TimeseriesForm mode="add" />
              <StamdataFooter
                cancel={cancel}
                nextTab={nextTab}
                handleOpret={handleTimeseriesOpret}
                disabled={false}
                type="lokation og tidsserie"
              />
            </TabPanel>
            <TabPanel value={tabValue} index={'2'}>
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
              <StamdataFooter
                cancel={cancel}
                disabled={getValues().unit && !getValues().unit.unit_uuid}
                handleOpret={handleUnitOpret}
              />
            </TabPanel>
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
