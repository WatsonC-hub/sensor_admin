import {Box, Grid2} from '@mui/material';
import React, {useEffect} from 'react';
import {FormProvider} from 'react-hook-form';
import useControlSettingsForm from '~/features/configuration/api/useControlSettingsForm';
import ControlSettings from '~/features/configuration/components/ControlSettings';
import CreateControlSettings from '~/features/configuration/components/CreateControlSettings';
import useBreakpoints from '~/hooks/useBreakpoints';
import {ControlSettingsFormState as ControlSettingsType} from '../types';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {RadioButtonCheckedOutlined, RadioButtonUncheckedOutlined} from '@mui/icons-material';

import Button from '~/components/Button';
import {button_sx} from '../common_style';

type Props = {
  id: string;
  values: ControlSettingsType | undefined;
  setValues: (values: ControlSettingsType) => void;
};

const ControlSettingForm = ({id, values, setValues}: Props) => {
  const {isMobile} = useBreakpoints();
  const [registerSubmitter, removeSubmitter, timeseries, deleteState] = useCreateStationStore(
    (state) => [
      state.registerSubmitter,
      state.removeSubmitter,
      state.formState.timeseries,
      state.deleteState,
    ]
  );

  const controlSettingsFormMethods = useControlSettingsForm<ControlSettingsType>({
    defaultValues: values,
  });

  const {handleSubmit, reset, setValue, getValues} = controlSettingsFormMethods;

  useEffect(() => {
    reset(values);
  }, [values]);

  useEffect(() => {
    if (values !== undefined)
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

  const onChangeCallback = () => {
    const currentValues = getValues();
    setValues(currentValues);
    registerSubmitter(id, async () => {
      let valid: boolean = false;
      await handleSubmit((values) => {
        setValues(values);
        valid = true;
      })();
      return valid;
    });
  };

  return (
    <Grid2
      container
      size={12}
      display="flex"
      direction={isMobile ? 'column' : 'row'}
      alignItems="center"
    >
      <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} alignItems={'center'} gap={1}>
        <FormProvider {...controlSettingsFormMethods}>
          <ControlSettings>
            <CreateControlSettings
              containerGridSize={12}
              slotProps={{
                controlFrequency: {
                  required: values !== undefined,
                  disabled: values === undefined,
                  selectValue: timeseries?.[id]?.control_settings?.selectValue,
                  setSelectValue: (value) => {
                    setValue('selectValue', value);
                  },
                  onChangeCallback,
                },
                leadTime: {
                  disabled: values === undefined,
                  onChangeCallback,
                },
              }}
            />
          </ControlSettings>
        </FormProvider>
        <Grid2
          size={isMobile ? 12 : 3}
          alignContent={'center'}
          display="flex"
          justifyContent={isMobile ? 'end' : 'start'}
        >
          <Button
            bttype="primary"
            startIcon={
              values === undefined ? (
                <RadioButtonCheckedOutlined />
              ) : (
                <RadioButtonUncheckedOutlined />
              )
            }
            sx={{
              ...button_sx(values === undefined),
              alignSelf: 'center',
            }}
            onClick={() => {
              if (values === undefined) {
                onChangeCallback();
              } else {
                deleteState(id as `timeseries.${string}.control_settings`);
                reset({
                  controls_per_year: null,
                  lead_time: null,
                });
                removeSubmitter(id);
              }
            }}
          >
            Registrer senere
          </Button>
        </Grid2>
      </Box>
    </Grid2>
  );
};

export default ControlSettingForm;
