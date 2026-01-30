import {Box} from '@mui/material';
import React from 'react';
import FormStepButtons from './FormStepButtons';

import RessourceSection from '../sections/RessourceSection';
import FormFieldset from '~/components/formComponents/FormFieldset';
import ContactForm from '../forms/ContactForm';
import LocationAccessForm from '../forms/LocationAccessForm';
import {useCreateStationStore} from '../state/useCreateStationStore';

type Props = {
  activeStep: number;
  setActiveStep: (step: number) => void;
};

const AdditionalStep = ({activeStep, setActiveStep}: Props) => {
  const submitters = useCreateStationStore((state) => state.submitters);
  return (
    <>
      {activeStep === 2 && (
        <>
          <FormFieldset
            label="Yderligere oplysninger"
            sx={{width: '100%', p: 1}}
            labelPosition={-27}
          >
            <ContactForm />
            <LocationAccessForm />
            <RessourceSection />
          </FormFieldset>
          <Box display={'flex'} flexDirection={'column'} gap={1.5}>
            <FormStepButtons
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              key={'additional'}
              onFormIsValid={async () => {
                const valid = (
                  await Promise.all(Object.values(submitters).map(async (cb) => await cb()))
                ).every(Boolean);

                console.log('Additional step valid:', valid);

                return valid;
              }}
            />
          </Box>
        </>
      )}
    </>
  );
};

export default AdditionalStep;
