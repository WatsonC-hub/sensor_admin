import React, {useState} from 'react';
import useBreakpoints from '~/hooks/useBreakpoints';
import {ArrowBack, Save} from '@mui/icons-material';
import {Grid2, Typography} from '@mui/material';
import Button from '~/components/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AlertDialog from '~/components/AlertDialog';

import {useLocation} from 'react-router-dom';
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

  let {state} = useLocation();
  state = state ?? {};
  const [showAlert, setShowAlert] = useState(false);
  const {isMobile} = useBreakpoints();

  const [isFormError, formState] = useCreateStationStore((state) => [
    state.isFormError,
    state.formState,
  ]);

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
        {state.loc_id === undefined && (
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
        {(activeStep === 2 || state.loc_id !== undefined) && (
          <Button
            bttype="primary"
            disabled={isFormError}
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
        message={'Er du sikker på, at du vil færdiggøre oprettelsen af stationen?'}
        handleOpret={() => {
          console.log('Submitting form...', formState);
          if (!formState) return;
          const submitState: CreateStationPayload = {
            location: state.loc_id
              ? {loc_id: state.loc_id}
              : ((formState.location || {}) as CreateStationPayload['location']),
            timeseries: Object.values(formState.timeseries || {}).map((ts) => ({
              ...ts,
              sync: {
                ...ts.sync,
                sync_dmp: ts.sync?.owner_cvr ? true : false,
              },
            })),
          };
          stamdataNewMutation.mutate(submitState);
        }}
      />
    </Grid2>
  );
};

export default FormStepButtons;
