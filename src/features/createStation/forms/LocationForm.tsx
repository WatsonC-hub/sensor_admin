import React, {useEffect} from 'react';
import {FormProvider} from 'react-hook-form';
import useLocationForm from '~/features/station/api/useLocationForm';
import OptionalLocationForm from '~/features/station/components/stamdata/stamdataComponents/OptionalLocationForm';
import StamdataLocation from '~/features/station/components/stamdata/StamdataLocation';
import useBreakpoints from '~/hooks/useBreakpoints';
import {LocationController, CreateLocationData} from '../controller/types';
import {useCreateStationStore} from '../state/useCreateStationStore';

type Props = {
  controller: LocationController | undefined;
  onValidChange: (isValid: boolean, value?: CreateLocationData) => void;
};

const LocationForm = ({controller, onValidChange}: Props) => {
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;
  // const values = controller?.getValues()['meta'];
  const {setState, registerSubmitter, formState, setIsFormError, removeSubmitter} =
    useCreateStationStore((state) => state);
  // console.log('LocationForm values', values);
  const [locationFormMethods, LocationForm] = useLocationForm({
    mode: 'Add',
    context: {
      loc_id: undefined,
    },
    initialLocTypeId: formState?.location?.meta?.loctype_id,
    defaultValues: formState?.location?.meta,
  });

  const {
    trigger,
    formState: {isValid, isSubmitted},
    handleSubmit,
    watch,
    getValues,
  } = locationFormMethods;

  console.log('formValues', getValues());

  useEffect(() => {
    registerSubmitter('location.meta', async () => {
      let valid: boolean = false;
      await handleSubmit(
        (values) => {
          setState('location.meta', values);
          valid = true;
        },
        (errors) => console.log('errors', errors)
      )();
      return valid;
    });

    return () => removeSubmitter('location.meta');
  }, [handleSubmit]);

  useEffect(() => {
    controller?.registerSlice('meta', true, async () => {
      const isValid = await trigger();
      return isValid;
    });
  }, [controller]);

  useEffect(() => {
    console.log(isSubmitted, isValid);
    setIsFormError(isSubmitted ? !isValid : false);
  }, [isSubmitted, isValid]);

  const loctype_id = watch('loctype_id');

  return (
    <FormProvider {...locationFormMethods}>
      <StamdataLocation>
        <LocationForm size={size} loc_id={undefined} />
        {loctype_id && <OptionalLocationForm size={size} loc_id={undefined} />}
      </StamdataLocation>
    </FormProvider>
  );
};

export default LocationForm;
