import {Box} from '@mui/material';
import React, {useState} from 'react';
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
  const [submitters, location, timeseries] = useCreateStationStore((state) => [
    state.submitters,
    state.formState.location,
    state.formState.timeseries,
  ]);
  const [showVisibility, setShowVisibility] = useState(!!location?.visibility);
  const [showSla, setShowSla] = useState(!!location?.sla);
  const {superUser} = useUser();

  return (
    <>
      {activeStep === 2 && (
        <>
          <FormFieldset
            label="Yderligere oplysninger"
            sx={{width: '100%', p: 1}}
            labelPosition={-27}
          >
            {Object.values(timeseries ?? {}).length > 0 && (
              <VisibilitySection show={showVisibility} setShow={setShowVisibility} />
            )}

            {superUser && <SlaSection show={showSla} setShow={setShowSla} />}
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
