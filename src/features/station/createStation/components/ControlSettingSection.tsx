import {AddCircleOutline, Delete} from '@mui/icons-material';
import {Box, Grid2, Typography} from '@mui/material';
import React from 'react';
import {FormProvider} from 'react-hook-form';
import Button from '~/components/Button';
import useControlSettingsForm, {
  ControlSettingsFormValues,
} from '~/features/configuration/api/useControlSettingsForm';
import ControlSettings from '~/features/configuration/components/ControlSettings';
import CreateControlSettings from '~/features/configuration/components/CreateControlSettings';
import useBreakpoints from '~/hooks/useBreakpoints';

type Props = {
  index: number;
  controlSettingIndex: Array<number>;
  setControlSettingIndex: React.Dispatch<React.SetStateAction<Array<number>>>;
  removeControlSettingsAtIndex: (index: number) => void;
};

const ControlSettingSection = ({
  index,
  controlSettingIndex,
  setControlSettingIndex,
  removeControlSettingsAtIndex,
}: Props) => {
  const timeseriesHasControlSettings = controlSettingIndex.includes(index);
  const controlSettingsFormMethods = useControlSettingsForm<ControlSettingsFormValues>({
    defaultValues: {
      controls_per_year: null,
      selectValue: 1,
      dummy: null,
      lead_time: null,
      from_unit: false,
    },
    mode: 'add',
  });
  const {isMobile} = useBreakpoints();

  //   await handleControlsSubmit(
  //                 (data) => {
  //                   if (Object.values(data).some((value) => value !== null && value !== undefined)) {
  //                     onValidate('control_settings', {
  //                       controls_per_year: data.controls_per_year,
  //                       lead_time: data.lead_time,
  //                     });
  //                   }
  //                 },
  //                 (e) => {
  //                   onValidate('control_settings', null);
  //                   setFormErrors((prev) => ({
  //                     ...prev,
  //                     controlSettings: Object.keys(e).length > 0,
  //                   }));

  //                   isValid = Object.keys(e).length === 0;
  //                 }
  //               )();

  return (
    <>
      {timeseriesHasControlSettings && (
        <Grid2 container size={12} display="flex" alignItems="center" spacing={1}>
          <FormProvider {...controlSettingsFormMethods}>
            <ControlSettings>
              <CreateControlSettings
                slotProps={{
                  controlFrequency: {
                    onChangeCallback: () => {
                      console.log('test');
                    },
                  },
                }}
              />
            </ControlSettings>
          </FormProvider>
          <Button
            bttype="tertiary"
            startIcon={<Delete />}
            sx={{height: 'fit-content', alignSelf: 'center'}}
            onClick={() => {
              removeControlSettingsAtIndex(index);
            }}
          >
            Fjern kontrolhyppighed
          </Button>
        </Grid2>
      )}
      {!timeseriesHasControlSettings && (
        <Box display={isMobile ? 'flex' : undefined} justifyContent={isMobile ? 'end' : undefined}>
          <Button
            bttype="primary"
            sx={{
              width: 'fit-content',
              backgroundColor: 'transparent',
              border: 'none',
              ':hover': {
                backgroundColor: 'grey.200',
              },
            }}
            onClick={() => {
              setControlSettingIndex((prev) => [...prev, index]);
            }}
          >
            <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
              <Typography variant="body1" color="primary">
                Tilføj kontrolhyppighed
              </Typography>
              <AddCircleOutline color="primary" />
            </Box>
          </Button>
        </Box>
      )}
    </>
  );
};

export default ControlSettingSection;
