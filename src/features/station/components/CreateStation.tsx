import React, {ReactNode, useEffect} from 'react';
import NavBar from '~/components/NavBar';
import StationPageBoxLayout from './StationPageBoxLayout';
import {Box, Grid2, Tab, Tabs, Typography} from '@mui/material';
import useBreakpoints from '~/hooks/useBreakpoints';
import useLocationForm from '../api/useLocationForm';
import {LocationOnRounded, ShowChartRounded, BuildRounded, Error} from '@mui/icons-material';
import {tabsHeight} from '~/consts';
import {
  AddUnit,
  BoreholeAddLocation,
  BoreholeAddTimeseries,
  DefaultAddLocation,
  DefaultAddTimeseries,
  Watlevmp,
  watlevmpAddSchema,
} from '../schema';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {useCreateTabState} from '~/hooks/useQueryStateParameters';
import StamdataLocation from './stamdata/StamdataLocation';
import StamdataTimeseries from './stamdata/StamdataTimeseries';
import {FormProvider} from 'react-hook-form';
import StamdataUnit from './stamdata/StamdataUnit';
import DefaultUnitForm from './stamdata/stamdataComponents/DefaultUnitForm';
import useUnitForm from '../api/useUnitForm';
import Button from '~/components/Button';
import useWatlevmpForm from '../api/useWatlevmpForm';
import {useMutation} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {useLocation} from 'react-router-dom';
import useTimeseriesForm from '../api/useTimeseriesForm';
import StamdataWatlevmp from './stamdata/StamdataWatlevmp';
import DefaultWatlevmpForm from './stamdata/stamdataComponents/DefaultWatlevmpForm';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {toast} from 'react-toastify';

interface TabPanelProps {
  value: string | null;
  index: string;
  children: ReactNode;
}

function TabPanel({value, index, children}: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
    >
      {value === index && <Box p={1}>{children}</Box>}
    </div>
  );
}

const CreateStation = () => {
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;
  const [tabValue, setTabValue] = useCreateTabState();
  const {location: locationNavigate, station: stationNavigate} = useNavigationFunctions();
  let {state} = useLocation();

  state = state ?? {};

  const loc_id = state?.loc_id ?? undefined;

  console.log(loc_id);

  const defaultValues = {
    loctype_id: 'loctype_id' in state ? state.loctype_id : -1,
    ...state,
  };

  console.log(defaultValues);
  const [locationFormMethods, LocationForm] = useLocationForm({
    mode: 'Add',
    defaultValues: defaultValues,
    context: {
      loc_id: loc_id,
    },
  });

  const {
    getValues: getLocationValues,
    trigger: triggerLocation,
    reset: resetLocation,
    formState: {errors: locationErrors, isDirty: isLocationDirty},
    watch: watchLocation,
  } = locationFormMethods;

  const loc_name = watchLocation('loc_name');
  const loctype_id = watchLocation('loctype_id');
  const boreholeno = watchLocation('boreholeno');

  const [timeseriesFormMethods, TimeseriesForm] = useTimeseriesForm<
    DefaultAddTimeseries | BoreholeAddTimeseries
  >({
    mode: 'Add',
    defaultValues: {
      tstype_id: -1,
      intakeno: -1,
    },
    context: {
      loctype_id: loctype_id,
    },
  });

  const {
    getValues: getTimeseriesValues,
    trigger: triggerTimeseries,
    reset: resetTimeseries,
    formState: {errors: timeseriesErrors, isDirty: isTimeseriesDirty},
    watch: watchTimeseries,
  } = timeseriesFormMethods;

  const tstype_id = watchTimeseries('tstype_id');

  const unitFormMethods = useUnitForm<AddUnit>({
    mode: 'Add',
    defaultValues: {
      startdate: '',
      unit_uuid: '',
    },
  });

  const {
    getValues: getUnitValues,
    trigger: triggerUnit,
    reset: resetUnit,
    formState: {isDirty: isUnitDirty},
  } = unitFormMethods;

  const watlevmpFormMethods = useWatlevmpForm<Watlevmp>({
    schema: watlevmpAddSchema,
    defaultValues: {},
  });

  const {
    getValues: getWatlevmpValues,
    trigger: triggerWatlevmp,
    reset: resetWatlevmp,
    formState: {errors: watlevmpErrors, isDirty: isWatlevmpDirty},
  } = watlevmpFormMethods;

  const stamdataNewMutation = useMutation({
    mutationFn: async (data: {
      location: DefaultAddLocation | BoreholeAddLocation;
      timeseries: DefaultAddTimeseries | BoreholeAddTimeseries;
      unit: AddUnit;
      watlevmp?: Watlevmp;
    }) => {
      const {data: out} = await apiClient.post(`/sensor_field/stamdata/`, data);
      return out;
    },
    onSuccess: (data) => {
      toast.success('Lokation oprettet');
      locationNavigate(data.loc_id);
    },
  });

  const stamdataNewLocationMutation = useMutation({
    mutationFn: async (data: {location: DefaultAddLocation | BoreholeAddLocation}) => {
      const {data: out} = await apiClient.post(
        `/sensor_field/stamdata/create_location`,
        data.location
      );
      return out;
    },
    onSuccess: (data) => {
      toast.success(loc_id ? 'Tidsserie oprettet' : 'Lokation og tidsserie oprettet');
      stationNavigate(data.loc_id, data.ts_id);
    },
  });

  const stamdataNewTimeseriesMutation = useMutation({
    mutationFn: async (data: {
      location: DefaultAddLocation | BoreholeAddLocation;
      timeseries: DefaultAddTimeseries | BoreholeAddTimeseries;
      watlevmp?: Watlevmp;
    }) => {
      const {data: out} = await apiClient.post(`/sensor_field/stamdata/create_timeseries`, data);
      return out;
    },
    onSuccess: (data) => {
      toast.success(
        loc_id ? 'Tidsserie og udstyr oprettet' : 'Lokation, tidsserie og udstyr oprettet'
      );
      stationNavigate(data.loc_id, data.ts_id);
    },
  });

  const nextTab = async () => {
    let valid = false;

    if (tabValue === 'lokation') {
      valid = await triggerLocation();
    } else if (tabValue === 'tidsserie') {
      valid = await triggerTimeseries();
      const isWaterlevel = getTimeseriesValues()?.tstype_id === 1;
      if (isWaterlevel) valid = await triggerWatlevmp();
    }

    if (tabValue === 'lokation' && valid) setTabValue('tidsserie');
    else if (tabValue === 'tidsserie' && valid) setTabValue('udstyr');
  };

  const handleSubmit = async () => {
    const isLocationValid = isLocationDirty ? await triggerLocation() : true;
    const isTimeseriesValid = isTimeseriesDirty ? await triggerTimeseries() : true;
    const isUnitValid = isUnitDirty ? await triggerUnit() : true;

    const locationData =
      getLocationValues('loctype_id') === 9
        ? {
            ...getLocationValues(),
            loc_name: boreholeno + ' - ' + getLocationValues('suffix'),
          }
        : getLocationValues();

    const timeseriesData = getTimeseriesValues();
    const unitData = getUnitValues();
    const watlevmpData = getWatlevmpValues();

    const isWaterLevel = timeseriesData.tstype_id === 1;

    const isWatlevmpValid = isWaterLevel
      ? isWatlevmpDirty
        ? await triggerWatlevmp()
        : true
      : true;

    let form;

    if (isLocationValid && isLocationDirty && !isTimeseriesDirty && !isUnitDirty) {
      form = {
        location: locationData,
      } as {location: DefaultAddLocation | BoreholeAddLocation};

      stamdataNewLocationMutation.mutate(form);
    }

    if (isLocationValid && isTimeseriesValid && isTimeseriesDirty && !isUnitDirty) {
      if (isWaterLevel && isWatlevmpValid && isWatlevmpDirty) {
        form = {
          location: locationData,
          timeseries: timeseriesData,
          watlevmp: watlevmpData,
        } as {
          location: DefaultAddLocation | BoreholeAddLocation;
          timeseries: DefaultAddTimeseries | BoreholeAddTimeseries;
          watlevmp?: Watlevmp;
        };
      } else {
        form = {
          location: locationData,
          timeseries: timeseriesData,
        } as {
          location: DefaultAddLocation | BoreholeAddLocation;
          timeseries: DefaultAddTimeseries | BoreholeAddTimeseries;
        };
      }

      stamdataNewTimeseriesMutation.mutate(form);
    }

    if (isLocationValid && isTimeseriesValid && isWatlevmpValid && isUnitValid && isUnitDirty) {
      form = {
        unit: unitData,
        location: locationData,
        timeseries: timeseriesData,
        watlevmp: isWaterLevel ? watlevmpData : undefined,
      } as {
        location: DefaultAddLocation | BoreholeAddLocation;
        timeseries: DefaultAddTimeseries | BoreholeAddTimeseries;
        watlevmp?: Watlevmp;
        unit: AddUnit;
      };

      stamdataNewMutation.mutate(form);
    }
  };

  useEffect(() => {
    if (loctype_id !== 9 && boreholeno !== undefined) {
      resetLocation({loctype_id});
    }
  }, [loctype_id]);

  return (
    <>
      <NavBar>
        <NavBar.GoBack />
        <NavBar.Title title="Opret Stamdata" />
        <NavBar.Menu />
      </NavBar>
      <StationPageBoxLayout>
        <Grid2
          container
          alignSelf={'center'}
          display={'flex'}
          flexDirection={'column'}
          spacing={1.5}
          sx={{maxWidth: 1200, width: '100%'}}
          size={size}
        >
          <Tabs
            value={tabValue !== null ? tabValue : 'lokation'}
            onChange={(_, newValue) => {
              setTabValue(newValue);
            }}
            variant="fullWidth"
            aria-label="simple tabs example"
            sx={{'& .MuiTab-root': {height: tabsHeight, minHeight: tabsHeight, marginTop: 1}}}
          >
            <Tab
              value={'lokation'}
              icon={
                Object.keys(locationErrors).length > 0 ? (
                  <Error sx={{marginTop: 1, color: '#d32f2f'}} />
                ) : (
                  <LocationOnRounded sx={{marginTop: 1}} fontSize="small" />
                )
              }
              label={
                <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
                  Lokation
                </Typography>
              }
            />
            <Tab
              value={'tidsserie'}
              icon={
                Object.keys(timeseriesErrors).length > 0 ||
                Object.keys(watlevmpErrors).length > 0 ? (
                  <Error sx={{marginTop: 1, color: '#d32f2f'}} />
                ) : (
                  <ShowChartRounded sx={{marginTop: 1}} fontSize="small" />
                )
              }
              label={
                <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
                  Tidsserie
                </Typography>
              }
            />
            <Tab
              value={'udstyr'}
              icon={<BuildRounded sx={{marginTop: 1}} fontSize="small" />}
              label={
                <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
                  Udstyr
                </Typography>
              }
            />
          </Tabs>
          <TabPanel value={tabValue} index={'lokation'}>
            <FormProvider {...locationFormMethods}>
              <StamdataLocation>
                <LocationForm size={size} loc_id={loc_id} />
              </StamdataLocation>
            </FormProvider>
          </TabPanel>
          <TabPanel value={tabValue} index={'tidsserie'}>
            <FormProvider {...timeseriesFormMethods}>
              <StamdataTimeseries boreholeno={boreholeno}>
                <Grid2 container size={12} spacing={1}>
                  <TimeseriesForm size={size} loc_name={loc_name} />
                  <Grid2 size={size} display={'flex'} flexDirection={'row'} gap={2}>
                    <FormProvider {...watlevmpFormMethods}>
                      <StamdataWatlevmp tstype_id={tstype_id}>
                        <DefaultWatlevmpForm />
                      </StamdataWatlevmp>
                    </FormProvider>
                  </Grid2>
                </Grid2>
              </StamdataTimeseries>
            </FormProvider>
          </TabPanel>
          <TabPanel value={tabValue} index={'udstyr'}>
            <FormProvider {...unitFormMethods}>
              <StamdataUnit tstype_id={tstype_id}>
                <DefaultUnitForm />
              </StamdataUnit>
            </FormProvider>
          </TabPanel>
          <Grid2 size={12} sx={{display: 'flex', justifyContent: 'end'}} gap={2}>
            <Button
              bttype="tertiary"
              onClick={() => {
                resetLocation();
                resetTimeseries();
                resetUnit();
                resetWatlevmp();
              }}
            >
              Annuller
            </Button>

            <Button
              bttype="primary"
              sx={{marginRight: 1, display: tabValue === 'udstyr' ? 'none' : 'flex'}}
              onClick={nextTab}
              hidden={tabValue === 'udstyr'}
              endIcon={<ArrowForwardIcon fontSize="small" />}
            >
              <Box display="flex" alignItems="center">
                Videre til
                {tabValue === 'lokation' ? ' tidsserie' : tabValue === 'tidsserie' ? ' udstyr' : ''}
              </Box>
            </Button>

            <Button
              bttype="primary"
              onClick={() => {
                handleSubmit();
              }}
              disabled={loctype_id === -1}
            >
              Gem & afslut
            </Button>
          </Grid2>
        </Grid2>
      </StationPageBoxLayout>
    </>
  );
};

export default CreateStation;
