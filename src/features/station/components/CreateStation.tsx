import React, {useEffect} from 'react';
import NavBar from '~/components/NavBar';
import StationPageBoxLayout from './StationPageBoxLayout';
import {Box, Grid2, Step, StepButton, StepLabel, Stepper, Typography} from '@mui/material';
import useBreakpoints from '~/hooks/useBreakpoints';
import useLocationForm from '../api/useLocationForm';
import {
  AddUnit,
  BoreholeAddLocation,
  BoreholeAddTimeseries,
  DefaultAddLocation,
  DefaultAddTimeseries,
  Watlevmp,
  watlevmpAddSchema,
} from '../schema';
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
import {ArrowBack, ArrowRight, Save} from '@mui/icons-material';

const CreateStation = () => {
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;
  const {location: locationNavigate, station: stationNavigate} = useNavigationFunctions();
  let {state} = useLocation();
  const [activeStep, setActiveStep] = React.useState(
    state === undefined || state === null ? 0 : state.loc_id ? 1 : 0
  );

  state = state ?? {};

  const loc_id = state?.loc_id ?? undefined;

  const defaultValues = {
    ...state,
    loctype_id: 'loctype_id' in state ? state.loctype_id : -1,
  } as Partial<DefaultAddLocation | BoreholeAddLocation>;

  const [locationFormMethods, LocationForm] = useLocationForm({
    mode: 'Add',
    defaultValues: defaultValues,
    context: {
      loc_id: loc_id,
    },
    initialLocTypeId: defaultValues.loctype_id ? defaultValues.loctype_id : -1,
  });

  const {
    getValues: getLocationValues,
    trigger: triggerLocation,
    formState: {errors: locationErrors, isDirty: isLocationDirty},
    watch: watchLocation,
    reset: resetLocation,
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
    formState: {isDirty: isUnitDirty},
  } = unitFormMethods;

  const watlevmpFormMethods = useWatlevmpForm<Watlevmp>({
    schema: watlevmpAddSchema,
    defaultValues: {},
  });

  const {
    getValues: getWatlevmpValues,
    trigger: triggerWatlevmp,
    formState: {errors: watlevmpErrors, isDirty: isWatlevmpDirty},
    clearErrors: clearWatlevmpErrors,
  } = watlevmpFormMethods;

  const stamdataNewLocationMutation = useMutation({
    mutationFn: async (location: DefaultAddLocation | BoreholeAddLocation) => {
      const response = await apiClient.post(`/sensor_field/stamdata/create_location`, location);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Lokation oprettet');
      locationNavigate(data.loc_id);
    },
  });

  const stamdataNewTimeseriesMutation = useMutation({
    mutationFn: async (data: {
      location: DefaultAddLocation | BoreholeAddLocation;
      timeseries: DefaultAddTimeseries | BoreholeAddTimeseries;
      watlevmp?: Watlevmp;
    }) => {
      const {data: out} = await apiClient.post(
        `/sensor_field/stamdata/create_timeseries/${loc_id ?? -1}`,
        data
      );
      return out;
    },
    onSuccess: (data) => {
      toast.success(loc_id ? 'Tidsserie oprettet' : 'Lokation og tidsserie oprettet');
      stationNavigate(data.loc_id, data.ts_id);
    },
  });

  const stamdataNewMutation = useMutation({
    mutationFn: async (data: {
      location: DefaultAddLocation | BoreholeAddLocation;
      timeseries: DefaultAddTimeseries | BoreholeAddTimeseries;
      unit: AddUnit;
      watlevmp?: Watlevmp;
    }) => {
      const {data: out} = await apiClient.post(`/sensor_field/stamdata/${loc_id ?? -1}`, data);
      return out;
    },
    onSuccess: (data) => {
      toast.success(
        loc_id ? 'Tidsserie og udstyr oprettet' : 'Lokation, tidsserie og udstyr oprettet'
      );

      stationNavigate(data.loc_id, data.ts_id);
    },
  });

  const handleSubmit = async () => {
    const isLocationValid = isLocationDirty ? await triggerLocation() : true;
    const isTimeseriesValid = isTimeseriesDirty ? await triggerTimeseries() : true;
    const isUnitValid = isUnitDirty ? await triggerUnit() : true;

    const locationData = getLocationValues();
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
      stamdataNewLocationMutation.mutate(locationData);
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

  const denyStepping = () => {
    if (activeStep === 0) {
      return Object.keys(locationErrors).length > 0 || loctype_id === -1;
    } else if (activeStep === 1) {
      return (
        Object.keys(timeseriesErrors).length > 0 ||
        Object.keys(watlevmpErrors).length > 0 ||
        tstype_id === -1
      );
    }

    return false;
  };

  const validateStepping = async () => {
    let valid = true;
    if (activeStep === 0) valid = await triggerLocation();
    if (activeStep === 1) {
      valid = await triggerTimeseries();
      const isWaterlevel = tstype_id === 1;
      if (isWaterlevel && valid) {
        valid = await triggerWatlevmp();
      }
    }
    return !denyStepping() && valid;
  };

  useEffect(() => {
    if (loctype_id !== 9 && boreholeno !== undefined) {
      resetLocation({loctype_id: loctype_id});
    }

    if (Object.keys(locationErrors).length > 0 && loctype_id !== -1) triggerLocation();
  }, [loctype_id]);

  useEffect(() => {
    clearWatlevmpErrors();
  }, [tstype_id]);

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
          <Stepper nonLinear activeStep={activeStep} alternativeLabel>
            <Step key={'lokation'}>
              <StepButton
                disabled={denyStepping()}
                onClick={async () => {
                  if (activeStep !== 0) {
                    const isTimeseriesValid = await triggerTimeseries();
                    const isWaterlevel = tstype_id === 1;
                    const isWatlevmpValid = isWaterlevel ? await triggerWatlevmp() : true;
                    if (isTimeseriesValid && isWatlevmpValid) {
                      setActiveStep(0);
                    }
                  }
                }}
              >
                <StepLabel error={Object.keys(locationErrors).length > 0}>
                  <Typography variant="body2" textTransform={'capitalize'}>
                    Lokation
                  </Typography>
                </StepLabel>
              </StepButton>
            </Step>
            <Step key={'tidsserie'} completed={false}>
              <StepButton
                onClick={async () => {
                  if (activeStep !== 1) {
                    const isLocationValid = await triggerLocation();
                    if (isLocationValid) {
                      setActiveStep(1);
                    }
                  }
                }}
                disabled={denyStepping()}
              >
                <StepLabel
                  error={
                    Object.keys(timeseriesErrors).length > 0 ||
                    Object.keys(watlevmpErrors).length > 0
                  }
                >
                  <Typography variant="body2" textTransform={'capitalize'}>
                    Tidsserie
                  </Typography>
                </StepLabel>
              </StepButton>
            </Step>
            <Step key={'udstyr'} completed={false}>
              <StepButton
                onClick={async () => {
                  if (activeStep !== 2) {
                    const isTimeseriesValid = await triggerTimeseries();
                    const isLocationValid = await triggerLocation();
                    const isWaterlevel = tstype_id === 1;
                    const isWatlevmpValid = isWaterlevel ? await triggerWatlevmp() : true;
                    if (isTimeseriesValid && isWatlevmpValid && isLocationValid) {
                      setActiveStep(2);
                    }
                  }
                }}
              >
                <StepLabel>
                  <Typography variant="body2" textTransform={'capitalize'}>
                    Udstyr
                  </Typography>
                </StepLabel>
              </StepButton>
            </Step>
          </Stepper>
          {activeStep === 0 && (
            <FormProvider {...locationFormMethods}>
              <StamdataLocation>
                <LocationForm size={size} loc_id={loc_id} />
              </StamdataLocation>
            </FormProvider>
          )}
          {activeStep === 1 && (
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
          )}
          {activeStep === 2 && (
            <FormProvider {...unitFormMethods}>
              <StamdataUnit tstype_id={tstype_id}>
                <DefaultUnitForm />
              </StamdataUnit>
            </FormProvider>
          )}
          <Grid2 size={12} sx={{display: 'flex', justifyContent: 'end'}} gap={2}>
            <Box sx={{flex: '1 1 auto'}} />
            <Button
              bttype="primary"
              color="inherit"
              startIcon={<ArrowBack />}
              disabled={activeStep === 0 || denyStepping()}
              onClick={async () => {
                const valid = await validateStepping();
                if (valid) {
                  setActiveStep(activeStep - 1);
                }
              }}
              sx={{mr: 1}}
            >
              Tilbage
            </Button>
            <Button
              bttype="primary"
              disabled={activeStep === 2 || denyStepping()}
              startIcon={<ArrowRight />}
              onClick={async () => {
                const valid = await validateStepping();
                if (valid) setActiveStep(activeStep + 1);
              }}
              sx={{mr: 1}}
            >
              Næste
            </Button>
            <Button
              bttype="primary"
              startIcon={<Save />}
              onClick={handleSubmit}
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
