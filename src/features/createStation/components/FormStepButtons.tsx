import React, {useState} from 'react';
import useBreakpoints from '~/hooks/useBreakpoints';
import {ArrowBack, Save} from '@mui/icons-material';
import {Grid2, Typography} from '@mui/material';
import Button from '~/components/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AlertDialog from '~/components/AlertDialog';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {CreateStationPayload} from '../types';
import {useMutation} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';
import {useDisplayState} from '~/hooks/ui';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

type Props = {
  activeStep: number;
  setActiveStep: (step: number) => void;
  onFormIsValid: () => Promise<boolean>;
  loc_id?: number;
};

const FormStepButtons = ({activeStep, setActiveStep, onFormIsValid, loc_id}: Props) => {
  const [showLocationRouter, setShowLocationRouter] = useDisplayState((state) => [
    state.showLocationRouter,
    state.setShowLocationRouter,
  ]);
  const {location: locationNavigate, station: stationNavigate} = useNavigationFunctions();

  const [showAlert, setShowAlert] = useState(false);
  const {isMobile} = useBreakpoints();

  const [isFormError, formState, submitters] = useCreateStationStore((state) => [
    state.isFormError,
    state.formState,
    state.submitters,
  ]);

  const isDisabled = isFormError || (loc_id != undefined && Object.values(submitters).length === 0);
  const stamdataNewMutation = useMutation({
    mutationFn: async (data: CreateStationPayload) => {
      const {data: out} = await apiClient.post(`/sensor_field/stamdata/create_station`, data);
      return out;
    },
    onSuccess: (data) => {
      toast.success('Station oprettet succesfuldt!');
      locationNavigate(data.loc_id, true);
      if (data.ts_id && data.ts_id.length > 0) stationNavigate(data.ts_id[0]);
      if (showLocationRouter) setShowLocationRouter(false);
    },
    meta: {
      invalidates: [['metadata']],
    },
  });

  const timeseries = Object.values(formState?.timeseries || []);
  const withEquipment = timeseries.filter((ts) => ts.unit !== undefined).length;

  const location_meta = formState?.location?.meta;

  const loc_name = location_meta?.boreholeno
    ? location_meta?.boreholeno + (location_meta?.suffix ? ' - ' + location_meta?.suffix : '')
    : location_meta?.loc_name;

  const dialogMessage = loc_id
    ? `Du er i gang med at tilføje tidsserier til lokationen: \n ${loc_name} \n\n Der er blevet tilføjet ${timeseries.length} ${timeseries.length > 1 ? 'tidsserier' : 'tidsserie'} (${withEquipment} med udstyr). \n\n Er du sikker på, at du vil færdiggøre oprettelsen?`
    : `Du er i gang med at oprette en ny lokation med dette navn: \n ${loc_name} \n\n Der er blevet tilføjet ${timeseries.length}  ${timeseries.length > 1 ? 'tidsserier' : 'tidsserie'} (${withEquipment} med udstyr). \n\n Er du sikker på, at du vil færdiggøre oprettelsen?`;

  const handleSubmit = () => {
    if (!formState) return;

    const submitState = {
      location: loc_id ? {loc_id: loc_id} : formState.location!,
      timeseries: Object.values(formState.timeseries || {}),
    };

    stamdataNewMutation.mutate(submitState);
  };

  return (
    <Grid2 size={12} gap={0.5} pr={0.5}>
      <Grid2 size={isMobile ? 12 : 'auto'} sx={{alignItems: 'center', display: 'flex'}}>
        {(activeStep === 0 || activeStep === 1) && (
          <Typography variant="caption" alignContent={'center'}>
            Felter markeret med en stjerne (*) er obligatoriske.
          </Typography>
        )}
      </Grid2>
      <Grid2 size={isMobile ? 12 : 'auto'} sx={{display: 'flex', justifyContent: 'flex-end'}}>
        {loc_id === undefined && (
          <>
            <Button
              bttype="primary"
              color="inherit"
              startIcon={!isMobile && <ArrowBack />}
              disabled={activeStep === 0 || (loc_id !== undefined && activeStep === 1)}
              onClick={async () => {
                const isStepValid = await onFormIsValid();
                if (!isStepValid) return;
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
                const isStepValid = await onFormIsValid();
                if (!isStepValid) return;
                setActiveStep(activeStep + 1);
              }}
              sx={{mr: 1}}
            >
              {isMobile && <ArrowForwardIcon fontSize="small" />}
              {!isMobile && 'Næste'}
            </Button>
          </>
        )}
        {(activeStep === 2 || loc_id !== undefined) && (
          <Button
            bttype="primary"
            disabled={isDisabled}
            startIcon={!isMobile && <Save fontSize="small" />}
            onClick={async () => {
              const isStepValid = await onFormIsValid();
              if (isStepValid) {
                setShowAlert(true);
              }
            }}
          >
            {!isMobile ? `Gem & afslut` : <Save fontSize="small" />}
          </Button>
        )}
      </Grid2>
      <AlertDialog
        open={showAlert}
        setOpen={setShowAlert}
        title="Færdiggør oprettelse"
        saveTitle={
          loc_id
            ? timeseries.length > 1
              ? 'Opret tidsserier'
              : 'Opret tidsserie'
            : 'Opret lokation'
        }
        message={dialogMessage}
        handleOpret={handleSubmit}
      />
    </Grid2>
  );
};

export default FormStepButtons;
