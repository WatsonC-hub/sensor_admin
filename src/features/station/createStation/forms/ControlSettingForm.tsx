import {Grid2} from '@mui/material';
import React, {useEffect} from 'react';
import {FormProvider} from 'react-hook-form';
import useControlSettingsForm from '~/features/configuration/api/useControlSettingsForm';
import ControlSettings from '~/features/configuration/components/ControlSettings';
import CreateControlSettings from '~/features/configuration/components/CreateControlSettings';
import useBreakpoints from '~/hooks/useBreakpoints';
import {ControlSettings as ControlSettingsType, TimeseriesPayload} from '../controller/types';
import {useAggregateController} from '../controller/useAggregateController';

type Props = {
  controller: ReturnType<typeof useAggregateController<TimeseriesPayload>>;
};

const ControlSettingForm = ({controller}: Props) => {
  const {isMobile} = useBreakpoints();
  const controlSettingsFormMethods = useControlSettingsForm<ControlSettingsType>({
    defaultValues: controller.getSlices()['control_settings']?.value,
  });
  const {
    formState: {isValid, isValidating},
    trigger,
    getValues,
  } = controlSettingsFormMethods;

  useEffect(() => {
    controller.registerSlice('control_settings', true, async () => {
      const isValid = await trigger();
      return isValid;
    });
  }, []);

  useEffect(() => {
    if (!isValidating) {
      const values = getValues();
      controller.updateSlice('control_settings', isValid, values);
    }
  }, [isValidating]);

  return (
    <Grid2
      container
      size={12}
      display="flex"
      direction={isMobile ? 'column-reverse' : 'row'}
      alignItems="center"
      spacing={1}
    >
      <FormProvider {...controlSettingsFormMethods}>
        <ControlSettings>
          <CreateControlSettings containerGridSize={12} />
        </ControlSettings>
      </FormProvider>
    </Grid2>
  );
};

export default ControlSettingForm;
