import React, {useState} from 'react';
import useBreakpoints from '~/hooks/useBreakpoints';
import {ArrowBack, Save} from '@mui/icons-material';
import {Grid2, Typography} from '@mui/material';
import Button from '~/components/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AlertDialog from '~/components/AlertDialog';

import {useLocation} from 'react-router-dom';
import {useCreateStationStore} from '../state/useCreateStationStore';

type Props = {
  activeStep: number;
  setActiveStep: (step: number) => void;
  onFormIsValid: () => Promise<boolean>;
  loc_id?: number;
};

const FormStepButtons = ({activeStep, setActiveStep, onFormIsValid, loc_id}: Props) => {
  let {state} = useLocation();
  state = state ?? {};
  const [showAlert, setShowAlert] = useState(false);
  const {isMobile} = useBreakpoints();

  const isFormError = useCreateStationStore((state) => state.isFormError);

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
        <Button
          bttype="primary"
          disabled={isFormError}
          startIcon={!isMobile && <Save fontSize="small" />}
          onClick={async () => {
            const isStepValid = await onFormIsValid();
            if (isStepValid && activeStep === 2) {
              setShowAlert(true);
            }
          }}
        >
          {!isMobile ? activeStep === 2 ? `Gem & afslut` : 'Gem' : <Save fontSize="small" />}
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
              ? `Du er i gang med at oprette en ${loc_id ? '' : 'lokation og'} tidsserie uden udstyr. Er du sikker på at du vil fortsætte?`
              : `Du er i gang med at oprette udstyr. Er du sikker på at du vil fortsætte?`
        }
        handleOpret={() => {
          // if (!formState) return;
          // const submitState: SubmitState = {
          //   ...formState,
          //   location: meta?.loc_id ? {loc_id: meta.loc_id} : formState.location,
          //   units: formState.units
          //     ? formState.units.map((unit) => ({
          //         unit_uuid: unit.unit_uuid,
          //         startdate: unit.startdate,
          //       }))
          //     : [],
          // };
          // stamdataNewMutation.mutate(submitState);
        }}
      />
    </Grid2>
  );
};

export default FormStepButtons;
