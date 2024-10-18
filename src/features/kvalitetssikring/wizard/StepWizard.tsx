import {KeyboardArrowLeft, KeyboardArrowRight} from '@mui/icons-material';
import {Box, Button, CardActions, MobileStepper, Card, CardContent, useTheme} from '@mui/material';
import {useSetAtom} from 'jotai';
import React, {useEffect, useState} from 'react';

import {qaSelection} from '~/state/atoms';

import WizardConfirmTimeseries from './WizardConfirmTimeseries';
import WizardDataExclude from './WizardExcludeData';
import WizardIntro from './WizardIntro';
import WizardLevelCorrection from './WizardLevelCorrection';
import WizardValueBounds from './WizardValueBounds';

interface StepWizardProps {
  setInitiateSelect: (initiateSelect: boolean) => void;
  setLevelCorrection: (levelCorrection: boolean) => void;
  initiateConfirmTimeseries: boolean;
  setInitiateConfirmTimeseries: (confirmTimeseries: boolean) => void;
}

const StepWizard = ({
  setInitiateSelect,
  setLevelCorrection,
  initiateConfirmTimeseries,
  setInitiateConfirmTimeseries,
}: StepWizardProps) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const [nextStep, setNextStep] = useState<number | null>(null);
  const setSelection = useSetAtom(qaSelection);

  const handleBack = () => {
    setActiveStep(0);
    setInitiateSelect(false);
    setInitiateConfirmTimeseries(false);
    setLevelCorrection(false);
    setSelection({});
  };

  useEffect(() => {
    if (nextStep === activeStep) setNextStep(null);
    if (activeStep === 4) setLevelCorrection(true);
    else setLevelCorrection(false);
  }, [nextStep, activeStep]);

  return (
    <Box height={'fit-content'} alignItems={'center'}>
      <Card
        raised={true}
        sx={{
          width: 'inherit',
          height: 'inherit',
          display: 'flex',
          flexDirection: 'column',
          flex: '1 0 auto',
          borderRadius: 4,
        }}
        elevation={12}
      >
        <CardContent sx={{height: '95%'}}>
          <Box width={'inherit'} height={'inherit'}>
            {activeStep === 0 && <WizardIntro setValue={setActiveStep} />}
            {activeStep === 1 && (
              <WizardConfirmTimeseries
                setStep={setActiveStep}
                initiateConfirmTimeseries={initiateConfirmTimeseries}
                setInitiateConfirmTimeseries={setInitiateConfirmTimeseries}
              />
            )}
            {activeStep === 2 && (
              <WizardDataExclude setStep={setActiveStep} setInitiateSelect={setInitiateSelect} />
            )}
            {activeStep === 3 && (
              <WizardValueBounds setStep={setActiveStep} setInitiateSelect={setInitiateSelect} />
            )}
            {activeStep === 4 && (
              <WizardLevelCorrection
                setStep={setActiveStep}
                setInitiateConfirmTimeseries={setInitiateConfirmTimeseries}
              />
            )}
          </Box>
        </CardContent>
        <CardActions sx={{marginTop: 'auto', justifySelf: 'end', alignSelf: 'center'}}>
          <MobileStepper
            steps={0}
            position="static"
            activeStep={activeStep}
            nextButton={<div></div>}
            backButton={
              <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                Tilbage
              </Button>
            }
          />
        </CardActions>
      </Card>
    </Box>
  );
};

export default StepWizard;
