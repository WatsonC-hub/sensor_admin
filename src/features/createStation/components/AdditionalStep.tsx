import {Typography} from '@mui/material';
import React from 'react';
import FormStepButtons from './FormStepButtons';

import RessourceSection from '../sections/RessourceSection';
import FormFieldset from '~/components/formComponents/FormFieldset';
import ContactForm from '../forms/ContactForm';
import LocationAccessForm from '../forms/LocationAccessForm';
import {useCreateStationStore} from '../state/useCreateStationStore';
import VisibilitySection from '../sections/VisibilitySection';
import SlaSection from '../sections/SlaSection';
import {useUser} from '~/features/auth/useUser';

type Props = {
  activeStep: number;
  setActiveStep: (step: number) => void;
};

const AdditionalStep = ({activeStep, setActiveStep}: Props) => {
  const [validateSubmitters, timeseries] = useCreateStationStore((state) => [
    state.validateSubmitters,
    state.formState.timeseries,
  ]);
  const {
    superUser,
    features: {ressources},
  } = useUser();

  return (
    <>
      {activeStep === 2 && (
        <>
          <Typography variant="caption" alignContent={'center'}>
            Felter markeret med en stjerne (*) er obligatoriske.
          </Typography>

          {Object.values(timeseries ?? {}).length > 0 && <VisibilitySection />}

          {superUser && <SlaSection />}
          <ContactForm />
          <LocationAccessForm />
          {ressources && <RessourceSection />}

          <FormStepButtons
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            key={'additional'}
            onFormIsValid={validateSubmitters}
          />
        </>
      )}
    </>
  );
};

export default AdditionalStep;
