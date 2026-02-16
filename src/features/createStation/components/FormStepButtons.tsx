import React, {useState} from 'react';
import useBreakpoints from '~/hooks/useBreakpoints';
import {ArrowBack, Save} from '@mui/icons-material';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid2,
  Typography,
} from '@mui/material';
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
import {useUser} from '~/features/auth/useUser';

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
  const [showDialog, setShowDialog] = useState<boolean>(false);
  let {state} = useLocation();
  state = state ?? {};
  const [showAlert, setShowAlert] = useState(false);
  const {isMobile} = useBreakpoints();
  const {superUser} = useUser();

  const [isFormError, formState, submitters] = useCreateStationStore((state) => [
    state.isFormError,
    state.formState,
    state.submitters,
  ]);

  const isDisabled = isFormError || (state.loc_id && Object.values(submitters).length === 0);
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

  const dialogMessage = loc_id
    ? `Du er i gang med at tilføje tidsserier til lokationen: ${formState?.location?.meta?.loc_name}. \n\n Der er blevet tilføjet ${timeseries.length} ${timeseries.length > 1 ? 'tidsserier' : 'tidsserie'} (${withEquipment} med udstyr). \n\n Er du sikker på, at du vil færdiggøre oprettelsen?`
    : `Du er i gang med at oprette en ny lokation med dette navn: ${formState?.location?.meta?.loc_name}. \n\n Der er blevet tilføjet ${timeseries.length}  ${timeseries.length > 1 ? 'tidsserier' : 'tidsserie'} (${withEquipment} med udstyr). \n\n Er du sikker på, at du vil færdiggøre oprettelsen?`;

  const handleSubmit = (confirmed?: boolean) => {
    if (!formState) return;
    let submitState: CreateStationPayload;
    if (!confirmed) {
      submitState = {
        location: {
          ...(state.loc_id
            ? {loc_id: state.loc_id}
            : ({
                ...formState.location,
                contacts:
                  formState.location?.contacts !== undefined ? formState.location.contacts : [],
                location_access:
                  formState.location?.location_access !== undefined
                    ? formState.location.location_access
                    : [],
                ressourcer:
                  formState.location?.ressourcer !== undefined ? formState.location.ressourcer : [],
              } as CreateStationPayload['location'])),
        },
        timeseries: Object.values(formState.timeseries || {}).map((ts) => ({
          ...ts,
          sync:
            ts.sync !== undefined
              ? {
                  ...ts.sync,
                  sync_dmp: ts.sync?.owner_cvr ? true : false,
                }
              : undefined,
        })),
      };
    } else {
      submitState = {
        location: state.loc_id
          ? {loc_id: state.loc_id}
          : ((formState.location || {}) as CreateStationPayload['location']),
        timeseries: Object.values(formState.timeseries || {}).map((ts) => ({
          ...ts,
          ...(ts.sync && {sync: {...ts.sync, sync_dmp: ts.sync?.owner_cvr ? true : false}}),
        })),
      };
    }

    console.log(submitState);

    setShowDialog(false);
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
          superUser
            ? 'Forsæt'
            : loc_id
              ? timeseries.length > 1
                ? 'Opret tidsserier'
                : 'Opret tidsserie'
              : 'Opret lokation'
        }
        message={dialogMessage}
        handleOpret={() => {
          if (superUser && loc_id === undefined) setShowDialog(true);
          else handleSubmit();
        }}
      />
      <Dialog open={showDialog} onClose={() => handleSubmit(false)}>
        <DialogTitle id="alert-dialog-title">Har du taget stilling til alle felter?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{whiteSpace: 'pre-line'}}>
            Stationen vil blive oprettet uanset dit valg. Hvis du vælger “Nej”, kan du efterfølgende
            tage stilling til felterne på stationssiden
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button bttype="tertiary" onClick={() => handleSubmit(false)}>
            Nej
          </Button>
          <Button bttype="primary" onClick={() => handleSubmit(true)}>
            Ja
          </Button>
        </DialogActions>
      </Dialog>
    </Grid2>
  );
};

export default FormStepButtons;
