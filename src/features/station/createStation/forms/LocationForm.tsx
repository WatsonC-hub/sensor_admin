import React, {useEffect} from 'react';
import {FormProvider} from 'react-hook-form';
import useLocationForm from '../../api/useLocationForm';
import OptionalLocationForm from '../../components/stamdata/stamdataComponents/OptionalLocationForm';
import StamdataLocation from '../../components/stamdata/StamdataLocation';
import useBreakpoints from '~/hooks/useBreakpoints';
import {LocationController, LocationData} from '../controller/types';

type Props = {
  controller: LocationController | undefined;
  onValidChange: (isValid: boolean, value?: LocationData) => void;
};

const LocationForm = ({controller, onValidChange}: Props) => {
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;
  const values = controller?.getValues()['meta'];
  console.log('LocationForm values', values);
  const [locationFormMethods, LocationForm] = useLocationForm({
    mode: 'Add',
    context: {
      loc_id: values?.loc_id,
    },
    initialLocTypeId: values?.loctype_id,
    defaultValues: values,
  });

  const {
    getValues,
    trigger,
    formState: {isValid, isValidating},
  } = locationFormMethods;

  useEffect(() => {
    controller?.registerSlice('meta', true, async () => {
      const isValid = await trigger();
      return isValid;
    });
  }, [controller]);

  useEffect(() => {
    if (!isValidating) {
      const values = getValues();
      console.log('LocationForm values changed', values);
      onValidChange(isValid, values);
    }
  }, [isValidating, isValid, values]);

  return (
    <FormProvider {...locationFormMethods}>
      <StamdataLocation>
        <LocationForm size={size} loc_id={values?.loc_id} />
        {values?.loctype_id && <OptionalLocationForm size={size} loc_id={values?.loc_id} />}
      </StamdataLocation>
    </FormProvider>
  );
};

export default LocationForm;
