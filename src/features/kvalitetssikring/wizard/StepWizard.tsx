import {KeyboardArrowLeft, KeyboardArrowRight} from '@mui/icons-material';
import {Box, Button, CardActions, MobileStepper, Card, CardContent, useTheme} from '@mui/material';
import React, {useEffect, useState} from 'react';

import useBreakpoints from '~/hooks/useBreakpoints';

import WizardFjernPunkter from './WizardFjernPunkter';
import WizardGodkendTidsserie from './WizardGodkendTidsserie';
import WizardIntro from './WizardIntro';
import WizardKorrigerSpring from './WizardKorrigerSpring';
import WizardValueBounds from './WizardValueBounds';

interface StepWizardProps {
  setInitiateSelect: (initiateSelect: boolean) => void;
  setLevelCorrection: (levelCorrection: boolean) => void;
}

const StepWizard = ({setInitiateSelect, setLevelCorrection}: StepWizardProps) => {
  const theme = useTheme();
  const {isMobile} = useBreakpoints();
  const [activeStep, setActiveStep] = React.useState(0);
  const [nextStep, setNextStep] = useState<number | null>(null);

  const handleBack = () => {
    setActiveStep(0);
  };

  useEffect(() => {
    if (nextStep === activeStep) setNextStep(null);
    if (activeStep === 4) setLevelCorrection(true);
    else setLevelCorrection(false);
  }, [nextStep, activeStep]);

  return (
    <Box
      maxWidth={isMobile ? '100%' : 1000}
      height={'fit-content'}
      minHeight={500}
      my={2}
      py={1.5}
      alignSelf={'start'}
    >
      <Card
        raised={true}
        sx={{
          width: 'inherit',
          height: 'inherit',
          display: 'flex',
          flexDirection: 'column',
          flex: '1 0 auto',
        }}
      >
        <CardContent sx={{height: '95%'}}>
          <Box width={'inherit'} height={'inherit'}>
            {activeStep === 0 && <WizardIntro setValue={setActiveStep} />}
            {activeStep === 1 && <WizardGodkendTidsserie setStep={setActiveStep} />}
            {activeStep === 2 && (
              <WizardFjernPunkter setStep={setActiveStep} setInitiateSelect={setInitiateSelect} />
            )}
            {activeStep === 3 && (
              <WizardValueBounds setStep={setActiveStep} setInitiateSelect={setInitiateSelect} />
            )}
            {activeStep === 4 && (
              <WizardKorrigerSpring setStep={setActiveStep} setInitiateSelect={setInitiateSelect} />
            )}
          </Box>
        </CardContent>
        <CardActions sx={{marginTop: 'auto', justifySelf: 'end', alignSelf: 'center'}}>
          <MobileStepper
            steps={5}
            position="static"
            activeStep={activeStep}
            sx={{maxWidth: 400, flexGrow: 1}}
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
