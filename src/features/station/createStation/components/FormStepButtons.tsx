import React, {useState} from 'react';
import useBreakpoints from '~/hooks/useBreakpoints';
import useCreateStationContext from '../api/useCreateStationContext';
import {ArrowBack, Save} from '@mui/icons-material';
import {Grid2, Typography} from '@mui/material';
import Button from '~/components/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useMutation} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';
import {useDisplayState} from '~/hooks/ui';
import AlertDialog from '~/components/AlertDialog';
import {FormState} from '~/helpers/CreateStationContextProvider';
import {Dayjs} from 'dayjs';

type Props = {
  onFormIsValid: () => Promise<boolean>;
};

type SubmitState = Omit<FormState, 'units'> & {
  units: Array<{
    unit_uuid: string;
    startdate: Dayjs;
  }>;
};

const FormStepButtons = ({onFormIsValid}: Props) => {
  const [showAlert, setShowAlert] = useState(false);
  const [showLocationRouter, setShowLocationRouter] = useDisplayState((state) => [
    state.showLocationRouter,
    state.setShowLocationRouter,
  ]);
  const {location: locationNavigate, station: stationNavigate} = useNavigationFunctions();

  const {activeStep, setActiveStep, meta, formState, formErrors} = useCreateStationContext();
  const {isMobile} = useBreakpoints();

  const stamdataNewMutation = useMutation({
    mutationFn: async (data: SubmitState) => {
      const {data: out} = await apiClient.post(
        `/sensor_field/stamdata/create_station/${meta?.loc_id ?? -1}`,
        data
      );
      return out;
    },
    onSuccess: (data) => {
      toast.success('Station oprettet succesfuldt!');
      locationNavigate(data.loc_id, true);
      stationNavigate(data.ts_id);
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
        <Button
          bttype="primary"
          color="inherit"
          startIcon={!isMobile && <ArrowBack />}
          disabled={activeStep === 0 || (meta?.loc_id !== undefined && activeStep === 1)}
          onClick={async () => {
            await onFormIsValid();
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
            await onFormIsValid();
            setActiveStep(activeStep + 1);
          }}
          sx={{mr: 1}}
        >
          {isMobile && <ArrowForwardIcon fontSize="small" />}
          {!isMobile && 'Næste'}
        </Button>
        <Button
          bttype="primary"
          startIcon={!isMobile && <Save fontSize="small" />}
          onClick={async () => {
            const isStepValid = await onFormIsValid();
            const formValid = Object.values(formErrors).every((error) => error !== true);
            if (formValid && isStepValid && activeStep === 2) {
              setShowAlert(true);
            }
          }}
          disabled={
            meta?.loctype_id === -1 || Object.values(formErrors).some((error) => error === true)
          }
        >
          {!isMobile ? activeStep === 3 ? `Gem & afslut` : 'Gem' : <Save fontSize="small" />}
        </Button>
      </Grid2>
      <AlertDialog
        open={showAlert}
        setOpen={setShowAlert}
        title="Færdiggør oprettelse"
        message={
          activeStep === 0
            ? `Du er i gang med at oprette en lokation uden tidsserie og udstyr. Er du sikker på at du vil fortsætte?`
            : activeStep === 1
              ? `Du er i gang med at oprette en ${meta?.loc_id ? '' : 'lokation og'} tidsserie uden udstyr. Er du sikker på at du vil fortsætte?`
              : `Du er i gang med at oprette udstyr. Er du sikker på at du vil fortsætte?`
        }
        handleOpret={() => {
          if (!formState) return;
          console.log(formState);
          const submitState: SubmitState = {
            ...formState,
            units: formState.units
              ? formState.units.map((unit) => ({
                  unit_uuid: unit.unit_uuid,
                  startdate: unit.startdate,
                }))
              : [],
          };

          stamdataNewMutation.mutate(submitState);
        }}
      />
    </Grid2>
  );
};

export default FormStepButtons;
