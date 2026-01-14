import {AddCircleOutline, Delete} from '@mui/icons-material';
import {Box, Grid2, Typography} from '@mui/material';
import React from 'react';
import {FieldArrayWithId, FormProvider, UseFieldArrayUpdate} from 'react-hook-form';
import Button from '~/components/Button';
import useControlSettingsForm, {
  ControlSettingsFormValues,
} from '~/features/configuration/api/useControlSettingsForm';
import ControlSettings from '~/features/configuration/components/ControlSettings';
import CreateControlSettings from '~/features/configuration/components/CreateControlSettings';
import useBreakpoints from '~/hooks/useBreakpoints';
import useCreateStationContext from '../api/useCreateStationContext';
import {FormState} from '~/helpers/CreateStationContextProvider';

type Props = {
  index: number;
  controlSettingIndex: Array<number>;
  setControlSettingIndex: React.Dispatch<React.SetStateAction<Array<number>>>;
  removeControlSettingsAtIndex: (index: number) => void;
  field: FieldArrayWithId<{timeseries: FormState['timeseries']}, 'timeseries', 'id'>;
  setValue: (key: 'lead_time' | 'controls_per_year', value: number) => void;
  update: UseFieldArrayUpdate<{timeseries: FormState['timeseries'] | undefined}, 'timeseries'>;
};

const ControlSettingSection = ({
  index,
  controlSettingIndex,
  setControlSettingIndex,
  removeControlSettingsAtIndex,
  field,
  setValue,
  update,
}: Props) => {
  const {
    onValidate,
    formState: {timeseries},
  } = useCreateStationContext();
  const timeseriesHasControlSettings = controlSettingIndex.includes(index);
  const controlSettingsFormMethods = useControlSettingsForm<ControlSettingsFormValues>({
    defaultValues: {
      controls_per_year: field.control_settings?.controls_per_year ?? undefined,
      selectValue: field.control_settings?.selectValue ?? 1,
      dummy: field.control_settings?.controls_per_year ?? undefined,
      lead_time: field.control_settings?.lead_time ?? undefined,
      from_unit: false,
    },
    mode: 'add',
  });
  const {isMobile} = useBreakpoints();

  const {setValue: setControlSettingsValue, watch} = controlSettingsFormMethods;
  const selectValue = watch('selectValue');
  return (
    <>
      {timeseriesHasControlSettings && (
        <Grid2 container size={12} display="flex" alignItems="center" spacing={1}>
          <FormProvider {...controlSettingsFormMethods}>
            <ControlSettings>
              <CreateControlSettings
                slotProps={{
                  controlFrequency: {
                    onChangeCallback: (e) => {
                      setValue('controls_per_year', e as number);

                      const prev = field.control_settings;
                      onValidate(
                        'control_settings',
                        {
                          ...prev,
                          controls_per_year: e as number,
                          selectValue: selectValue,
                        },
                        index
                      );
                    },
                    onBlurCallback: (e) => {
                      if (field.control_settings?.selectValue !== selectValue) {
                        setControlSettingsValue('selectValue', selectValue);
                      }
                      update(index, {
                        ...field,
                        control_settings: {
                          lead_time: field.control_settings?.lead_time,
                          selectValue: selectValue,
                          controls_per_year: parseInt(
                            (e as React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>)
                              .target.value
                          ),
                        },
                      });
                    },
                  },
                  leadTime: {
                    onChangeCallback: (e) => {
                      setValue('lead_time', e as number);
                      const prev = timeseries?.[index]?.control_settings;
                      onValidate(
                        'control_settings',
                        {
                          ...prev,
                          lead_time: e as number,
                          selectValue: selectValue,
                        },
                        index
                      );
                    },
                    onBlurCallback: (e) => {
                      if (field.control_settings?.selectValue !== selectValue) {
                        setControlSettingsValue('selectValue', selectValue);
                      }
                      update(index, {
                        ...field,
                        control_settings: {
                          lead_time: parseInt(
                            (e as React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>)
                              .target.value
                          ),
                          controls_per_year: field.control_settings?.controls_per_year,
                          selectValue: selectValue,
                        },
                      });
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
              onValidate('control_settings', undefined, index);
              update(index, {
                ...field,
                control_settings: undefined,
              });
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
