import React, {useEffect, useState} from 'react';
import NavBar from '~/components/NavBar';
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
import {useLocation, useNavigate} from 'react-router-dom';
import useTimeseriesForm from '../api/useTimeseriesForm';
import StamdataWatlevmp from './stamdata/StamdataWatlevmp';
import DefaultWatlevmpForm from './stamdata/stamdataComponents/DefaultWatlevmpForm';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {toast} from 'react-toastify';
import {ArrowBack, Save} from '@mui/icons-material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {queryClient} from '~/queryClient';
import AlertDialog from '~/components/AlertDialog';

const CreateStation = () => {
  const {isMobile} = useBreakpoints();
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const size = isMobile ? 12 : 6;
  const navigate = useNavigate();
  const {location: locationNavigate, station: stationNavigate} = useNavigationFunctions();
  let {state} = useLocation();
  const [activeStep, setActiveStep] = useState(
    state === undefined || state === null ? 0 : state.loc_id ? 1 : 0
  );

  state = state ?? {};

  const loc_id = state?.loc_id ?? undefined;

  const defaultValues = {
    ...state,
    loctype_id: 'loctype_id' in state ? state.loctype_id : -1,
  } as Partial<DefaultAddLocation | BoreholeAddLocation>;

  const [locationFormMethods, LocationForm] = useLocationForm<
    DefaultAddLocation | BoreholeAddLocation
  >({
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
    formState: {errors: locationErrors},
    watch: watchLocation,
    reset: resetLocation,
  } = locationFormMethods;

  const loc_name = watchLocation('loc_name');
  const loctype_id = watchLocation('loctype_id');
  const boreholeno = watchLocation('boreholeno');

  let timeseriesValues: {tstype_id: number; intakeno?: number} = {
    tstype_id: -1,
  };

  if (loctype_id === 9) {
    timeseriesValues = {
      ...timeseriesValues,
      intakeno: -1,
    };
  }

  const [timeseriesFormMethods, TimeseriesForm] = useTimeseriesForm<
    DefaultAddTimeseries | BoreholeAddTimeseries
  >({
    mode: 'Add',
    defaultValues: timeseriesValues,
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
    formState: {errors: watlevmpErrors},
    clearErrors: clearWatlevmpErrors,
  } = watlevmpFormMethods;

  const stamdataNewLocationMutation = useMutation({
    mutationFn: async (location: DefaultAddLocation | BoreholeAddLocation) => {
      const response = await apiClient.post(`/sensor_field/stamdata/create_location`, location);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({queryKey: ['timeseries', loc_id]});
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
      queryClient.invalidateQueries({queryKey: ['location_data', loc_id]});
      queryClient.invalidateQueries({queryKey: ['metadata', data.ts_id]});
      queryClient.invalidateQueries({queryKey: ['timeseries', loc_id]});
      navigate('/');
      stationNavigate(data.ts_id);
    },
  });

  const stamdataNewMutation = useMutation({
    mutationFn: async (data: {
      location: DefaultAddLocation | BoreholeAddLocation;
      timeseries: DefaultAddTimeseries | BoreholeAddTimeseries;
      unit: AddUnit;
      watlevmp?: Watlevmp;
    }) => {
      const {data: out} = await apiClient.post(
        `/sensor_field/stamdata/new_stamdata/${loc_id ?? -1}`,
        data
      );
      return out;
    },
    onSuccess: (data) => {
      toast.success(
        loc_id ? 'Tidsserie og udstyr oprettet' : 'Lokation, tidsserie og udstyr oprettet'
      );
      queryClient.invalidateQueries({queryKey: ['location_data', loc_id]});
      queryClient.invalidateQueries({queryKey: ['metadata', data.ts_id]});
      queryClient.invalidateQueries({queryKey: ['timeseries', loc_id]});
      navigate('/');
      stationNavigate(data.ts_id);
    },
  });

  const handleLocationSubmit = async () => {
    const isLocationValid = await triggerLocation();
    if (!isLocationValid) {
      return;
    }

    const locationData = getLocationValues();
    if (isLocationValid) {
      stamdataNewLocationMutation.mutate(locationData);
    }
  };

  const handleTimeseriesSubmit = async () => {
    const isLocationValid = await triggerLocation();
    const isTimeseriesValid = await triggerTimeseries();
    if (!isTimeseriesValid || !isLocationValid) {
      return;
    }

    const locationData = getLocationValues();
    const timeseriesData = getTimeseriesValues();
    const isWaterLevel = timeseriesData.tstype_id === 1;

    let form: {
      location: DefaultAddLocation | BoreholeAddLocation;
      timeseries: DefaultAddTimeseries | BoreholeAddTimeseries;
      watlevmp?: Watlevmp;
    };
    if (isWaterLevel) {
      const isWatlevmpValid = await triggerWatlevmp();
      if (!isWatlevmpValid) {
        return;
      }
      const watlevmpData = getWatlevmpValues();
      form = {
        location: locationData,
        timeseries: timeseriesData,
        watlevmp: watlevmpData,
      };
    } else {
      form = {
        location: locationData,
        timeseries: timeseriesData,
      };
    }
    stamdataNewTimeseriesMutation.mutate(form);
  };

  const handleStamdataSubmit = async () => {
    const isLocationValid = await triggerLocation();
    const isTimeseriesValid = isTimeseriesDirty ? await triggerTimeseries() : false;
    const isUnitValid = await triggerUnit();

    if (!isLocationValid || !isTimeseriesValid || !isUnitValid) {
      return;
    }

    const locationData = getLocationValues();
    const timeseriesData = getTimeseriesValues();
    const unitData = getUnitValues();
    const isWaterLevel = timeseriesData.tstype_id === 1;
    let form: {
      location: DefaultAddLocation | BoreholeAddLocation;
      timeseries: DefaultAddTimeseries | BoreholeAddTimeseries;
      unit: AddUnit;
      watlevmp?: Watlevmp;
    };
    if (isWaterLevel) {
      const isWatlevmpValid = await triggerWatlevmp();
      if (!isWatlevmpValid) {
        return;
      }
      const watlevmpData = getWatlevmpValues();
      form = {
        location: locationData,
        timeseries: timeseriesData,
        unit: unitData,
        watlevmp: watlevmpData,
      };
    } else {
      form = {
        location: locationData,
        timeseries: timeseriesData,
        unit: unitData,
      };
    }
    stamdataNewMutation.mutate(form);
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
    return valid;
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
      <Box display="flex" flexDirection={'column'} overflow="auto">
        <Grid2
          container
          alignSelf={'center'}
          display={'flex'}
          flexDirection={'column'}
          spacing={1.5}
          sx={{maxWidth: 1200, width: '100%'}}
          mx={'auto'}
          px={1}
          size={size}
          py={2}
        >
          <Stepper nonLinear activeStep={activeStep} alternativeLabel>
            <Step
              key={'lokation'}
              completed={Object.keys(locationErrors).length === 0 && activeStep !== 0}
            >
              <StepButton
                onClick={async () => {
                  if (activeStep !== 0) {
                    setActiveStep(0);
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
            <Step
              key={'tidsserie'}
              completed={
                Object.keys(timeseriesErrors).length === 0 &&
                Object.keys(watlevmpErrors).length === 0 &&
                activeStep !== 1 &&
                isTimeseriesDirty
              }
            >
              <StepButton
                onClick={async () => {
                  if (activeStep !== 1) {
                    setActiveStep(1);
                  }
                }}
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
            <Step key={'udstyr'} completed={activeStep !== 2 && isUnitDirty}>
              <StepButton
                onClick={async () => {
                  if (activeStep !== 2) {
                    setActiveStep(2);
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
          <Grid2 size={12} sx={{display: 'flex', justifyContent: 'end'}} gap={0.5} pr={0.5}>
            <Box sx={{flex: '1 1 auto'}} />
            <Button
              bttype="primary"
              color="inherit"
              startIcon={!isMobile && <ArrowBack />}
              disabled={activeStep === 0}
              onClick={async () => {
                setActiveStep(activeStep - 1);
              }}
              sx={{mr: 1}}
            >
              {isMobile && <ArrowBack />}
              {!isMobile && 'Tilbage'}
            </Button>
            <Button
              bttype="primary"
              disabled={activeStep === 2}
              endIcon={!isMobile && <ArrowForwardIcon fontSize="small" />}
              onClick={async () => {
                const valid = await validateStepping();
                if (valid) setActiveStep(activeStep + 1);
              }}
              sx={{mr: 1}}
            >
              {isMobile && <ArrowForwardIcon fontSize="small" />}
              {!isMobile && 'Næste'}
            </Button>
            <Button
              bttype="primary"
              startIcon={<Save />}
              onClick={async () => {
                // Handle submit based on the active step
                // But this also means that the user can fill out the form, but still only sumbit the first step

                if (activeStep === 0) {
                  const location_valid = await triggerLocation();
                  if (!location_valid) {
                    return;
                  }
                  setAlertTitle('Opret lokation');
                  setAlertMessage(
                    'Du er i gang med at oprette en lokation uden tidsserie og udstyr. Er du sikker på at du vil fortsætte?'
                  );
                  setShowAlert(true);
                } else if (activeStep === 1) {
                  const timeseries_valid = await triggerTimeseries();
                  const location_valid = await triggerLocation();
                  const isWaterlevel = tstype_id === 1;
                  const isWatlevmpValid = isWaterlevel ? await triggerWatlevmp() : true;

                  if (!timeseries_valid || !location_valid || !isWatlevmpValid) {
                    return;
                  }
                  setAlertTitle('Opret tidsserie');
                  setAlertMessage(
                    'Du er i gang med at oprette en lokation og tidsserie uden udstyr. Er du sikker på at du vil fortsætte?'
                  );
                  setShowAlert(true);
                } else if (activeStep === 2 && isUnitDirty) {
                  handleStamdataSubmit();
                }
              }}
              disabled={loctype_id === -1 || (state?.loc_id && activeStep === 0)}
            >
              Gem & afslut
            </Button>
          </Grid2>
        </Grid2>
      </Box>
      <AlertDialog
        open={showAlert}
        setOpen={setShowAlert}
        title={alertTitle}
        message={alertMessage}
        handleOpret={() => {
          if (activeStep === 0) {
            handleLocationSubmit();
          } else if (activeStep === 1 || (activeStep === 2 && !isUnitDirty)) {
            handleTimeseriesSubmit();
          }
        }}
      />
    </>
  );
};

export default CreateStation;
