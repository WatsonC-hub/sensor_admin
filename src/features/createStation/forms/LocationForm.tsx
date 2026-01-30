import React, {useEffect} from 'react';
import {FormProvider} from 'react-hook-form';
import useLocationForm from '~/features/station/api/useLocationForm';
import OptionalLocationForm from '~/features/station/components/stamdata/stamdataComponents/OptionalLocationForm';
import StamdataLocation from '~/features/station/components/stamdata/StamdataLocation';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useCreateStationStore} from '../state/useCreateStationStore';

const LocationForm = () => {
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;
  const {setState, registerSubmitter, formState, setIsFormError, removeSubmitter} =
    useCreateStationStore((state) => state);
  const [locationFormMethods, LocationForm] = useLocationForm({
    mode: 'Add',
    context: {
      loc_id: undefined,
    },
    initialLocTypeId: formState?.location?.meta?.loctype_id,
    defaultValues: formState?.location?.meta,
  });

  const {
    formState: {isValid, isSubmitted},
    handleSubmit,
    watch,
  } = locationFormMethods;

  useEffect(() => {
    registerSubmitter('location.meta', async () => {
      let valid: boolean = false;
      await handleSubmit((values) => {
        setState('location.meta', values);
        valid = true;
      })();
      return valid;
    });

    return () => removeSubmitter('location.meta');
  }, [handleSubmit]);

  useEffect(() => {
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
