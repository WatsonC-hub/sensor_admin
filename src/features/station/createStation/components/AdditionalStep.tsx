import {Box} from '@mui/material';
import React, {useEffect, useState} from 'react';
import FormStepButtons from './FormStepButtons';

import {RootPayload} from '../controller/types';
import {AggregateController} from '../controller/AggregateController';
import {LocationManager} from '../controller/LocationManager';
import ContactSection from '../sections/contactSection';
import LocationAccessSection from '../sections/LocationAccessSection';
import RessourceSection from '../sections/RessourceSection';
import FormFieldset from '~/components/formComponents/FormFieldset';

type Props = {
  activeStep: number;
  setActiveStep: (step: number) => void;
  RootController: AggregateController<RootPayload>;
  locationManager: LocationManager;
};

const AdditionalStep = ({activeStep, setActiveStep, RootController, locationManager}: Props) => {
  const loc_id = RootController.getValues().location?.meta.loc_id;
  const controller = locationManager.get()?.getController();

  // subscribe to manager changes
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsubscribe = locationManager.onChange(() => {
      setTick((x) => x + 1);
    });

    return () => {
      unsubscribe?.();
    }; // ✅ cleanup
  }, [locationManager]);

  return (
    <>
      {activeStep === 2 && (
        <>
          <FormFieldset
            label="Yderligere oplysninger"
            sx={{width: '100%', p: 1}}
            labelPosition={-27}
          >
            {loc_id === undefined && (
              <>
                <ContactSection controller={controller} />
                <LocationAccessSection controller={controller} />
                <RessourceSection controller={controller} />
              </>
            )}
          </FormFieldset>
          <Box display={'flex'} flexDirection={'column'} gap={1.5}>
            <FormStepButtons
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              key={'additional'}
              onFormIsValid={async () => {
                const isValid = await RootController.validateAllSlices();
                console.log('AdditionalStep values', RootController.getValues());

                return isValid;
              }}
            />
          </Box>
        </>
      )}
    </>
  );
};

export default AdditionalStep;
