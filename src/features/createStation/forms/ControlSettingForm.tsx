import {Grid2} from '@mui/material';
import React, {useEffect} from 'react';
import {FormProvider} from 'react-hook-form';
import useControlSettingsForm from '~/features/configuration/api/useControlSettingsForm';
import ControlSettings from '~/features/configuration/components/ControlSettings';
import CreateControlSettings from '~/features/configuration/components/CreateControlSettings';
import useBreakpoints from '~/hooks/useBreakpoints';
import {ControlSettingsFormState as ControlSettingsType} from '../types';
import {useCreateStationStore} from '../state/useCreateStationStore';

type Props = {
  id: string;
  control_settings?: ControlSettingsType;
  setValues: (values: ControlSettingsType) => void;
};

const ControlSettingForm = ({id, control_settings, setValues}: Props) => {
  const {isMobile} = useBreakpoints();
  const [registerSubmitter, removeSubmitter] = useCreateStationStore((state) => [
    state.registerSubmitter,
    state.removeSubmitter,
  ]);
  const controlSettingsFormMethods = useControlSettingsForm<ControlSettingsType>({
    defaultValues: control_settings,
  });

  const {handleSubmit} = controlSettingsFormMethods;

  useEffect(() => {
    registerSubmitter(id, async () => {
      let valid: boolean = false;
      await handleSubmit((values) => {
        setValues(values);
        valid = true;
      })();
      return valid;
    });

    return () => removeSubmitter(id);
  }, [handleSubmit]);

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
          <CreateControlSettings
            containerGridSize={12}
            slotProps={{
              controlFrequency: {
                disabled: false,
                selectValue: control_settings?.selectValue,
                setSelectValue: (value) => {
                  controlSettingsFormMethods.setValue('selectValue', value);
                },
              },
            }}
          />
        </ControlSettings>
      </FormProvider>
    </Grid2>
  );
};

export default ControlSettingForm;
