import React, {useEffect} from 'react';
import useCreateStationContext from '../api/useCreateStationContext';
import useLocationForm from '../../api/useLocationForm';
import {FormProvider} from 'react-hook-form';
import StamdataLocation from '../../components/stamdata/StamdataLocation';
import useBreakpoints from '~/hooks/useBreakpoints';
import FormStepButtons from './FormStepButtons';
import OptionalLocationForm from '../../components/stamdata/stamdataComponents/OptionalLocationForm';

const LocationStep = () => {
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;
  const {
    meta,
    setMeta,
    onValidate,
    formState: {location},
    formErrors,
    setFormErrors,
    activeStep,
  } = useCreateStationContext();

  const [locationFormMethods, LocationForm] = useLocationForm({
    defaultValues: location,
    mode: 'Add',
    context: {
      loc_id: meta?.loc_id,
    },
    initialLocTypeId: meta?.loctype_id,
  });

  const {
    handleSubmit,
    formState: {errors},
  } = locationFormMethods;

  useEffect(() => {
    if (formErrors.location)
      setFormErrors((prev) => ({
        ...prev,
        location: Object.keys(errors).length > 0,
      }));
  }, [errors]);

  return (
    <>
      {activeStep === 0 && (
        <>
          <FormProvider {...locationFormMethods}>
            <StamdataLocation>
              <LocationForm
                size={size}
                loc_id={meta?.loc_id}
                slotProps={{
                  loctypeSelect: {
                    onChangeCallback: (event) => {
                      const value = (
                        event as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
                      ).target.value;
                      setMeta((prev) => ({...prev, loctype_id: value as unknown as number}));
                    },
                  },
                  loc_name: {
                    onChangeCallback: (event) => {
                      const value = (
                        event as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
                      ).target.value;
                      setMeta((prev) => ({...prev, loc_name: value}));
                    },
                  },
                  boreholeno: {
                    onChangeCallback: (value) => {
                      setMeta((prev) => ({...prev, boreholeno: value?.boreholeno || ''}));
                    },
                  },
                }}
              />
              <OptionalLocationForm size={size} loc_id={meta?.loc_id} />
            </StamdataLocation>
          </FormProvider>
          <FormStepButtons
            key={'location'}
            onFormIsValid={async () => {
              let isValid = true;
              await handleSubmit(
                (data) => {
                  onValidate('location', data);
                },
                (e) => {
                  onValidate('location', null);
                  setFormErrors({
                    location: Object.keys(e).length > 0,
                  });

                  isValid = false;
                }
              )();

              return isValid;
            }}
          />
        </>
      )}
    </>
  );
};

export default LocationStep;
