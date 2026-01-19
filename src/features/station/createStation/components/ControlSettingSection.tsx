import {AddCircleOutline, RemoveCircleOutline} from '@mui/icons-material';
import {Box, Grid2, IconButton, Typography} from '@mui/material';
import React from 'react';
import {FieldArrayWithId, FormProvider, UseFieldArrayUpdate} from 'react-hook-form';
import Button from '~/components/Button';
import useControlSettingsForm, {
  ControlSettingsFormValues,
} from '~/features/configuration/api/useControlSettingsForm';
import ControlSettings from '~/features/configuration/components/ControlSettings';
import CreateControlSettings from '~/features/configuration/components/CreateControlSettings';
import useBreakpoints from '~/hooks/useBreakpoints';
import {FormState} from '~/helpers/CreateStationContextProvider';
import FormFieldset from '~/components/formComponents/FormFieldset';

type Props = {
  index: number;
  controlSettingIndex: Array<number>;
  setControlSettingIndex: React.Dispatch<React.SetStateAction<Array<number>>>;
  removeControlSettingsAtIndex: (index: number) => void;
  field: FieldArrayWithId<{timeseries: FormState['timeseries']}, 'timeseries', 'id'>;
  setValue: (key: 'lead_time' | 'controls_per_year' | 'selectValue', value: number) => void;
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
  const timeseriesHasControlSettings = controlSettingIndex.includes(index);
  const controlSettingsFormMethods = useControlSettingsForm<ControlSettingsFormValues>({
    defaultValues: {
      controls_per_year: field.control_settings?.controls_per_year ?? undefined,
      selectValue: field.control_settings?.selectValue ?? 1,
      lead_time: field.control_settings?.lead_time ?? undefined,
      from_unit: false,
    },
    mode: 'add',
  });
  const {isMobile} = useBreakpoints();

  const {watch} = controlSettingsFormMethods;
  const controlSetting = watch();

  return (
    <>
      {timeseriesHasControlSettings && (
        <FormFieldset
          label={
            isMobile ? (
              <Button
                bttype="borderless"
                sx={{p: 0, m: 0}}
                startIcon={<RemoveCircleOutline color="primary" />}
                onClick={() => {
                  update(index, {
                    ...field,
                    control_settings: undefined,
                  });
                  removeControlSettingsAtIndex(index);
                }}
              >
                <Typography variant="body2" color="grey.700">
                  Kontrolhyppighed
                </Typography>
              </Button>
            ) : (
              'Kontrolhyppighed'
            )
          }
          labelPosition={isMobile ? -22 : -20}
          sx={{width: '100%', p: 1}}
        >
          <Box display="flex" flexDirection="row" gap={1}>
            {!isMobile && (
              <IconButton
                color="primary"
                size="small"
                onClick={() => {
                  update(index, {
                    ...field,
                    control_settings: undefined,
                  });
                  removeControlSettingsAtIndex(index);
                }}
              >
                <RemoveCircleOutline />
              </IconButton>
            )}
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
                        selectValue: controlSetting.selectValue,
                        setSelectValue: (value) => {
                          setValue('selectValue', value);
                          update(index, {
                            ...field,
                            control_settings: {
                              lead_time: field.control_settings?.lead_time,
                              controls_per_year: field.control_settings?.controls_per_year,
                              selectValue: value,
                            },
                          });
                        },
                        onBlurCallback: (e) => {
                          let value: string | number | undefined = (
                            e as React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
                          ).target.value;

                          console.log('BLUR VALUE:', value, controlSetting.selectValue);
                          if (value === '' || value === undefined) value = undefined;
                          else if (controlSetting.selectValue === 1) value = Number(value);
                          else if (controlSetting.selectValue === 2)
                            value = Number((12 / Number(value)).toFixed(3));
                          console.log('PARSED BLUR VALUE:', value);
                          update(index, {
                            ...field,
                            control_settings: {
                              lead_time: field.control_settings?.lead_time,
                              controls_per_year: value ? Number(value) : undefined,
                              selectValue: controlSetting.selectValue,
                            },
                          });
                        },
                      },
                      leadTime: {
                        onBlurCallback: (e) => {
                          const value = Number(
                            (e as React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>)
                              .target.value
                          );
                          setValue('lead_time', value);
                          update(index, {
                            ...field,
                            control_settings: {
                              lead_time: value,
                              controls_per_year: field.control_settings?.controls_per_year,
                              selectValue: controlSetting.selectValue,
                            },
                          });
                        },
                      },
                    }}
                  />
                </ControlSettings>
              </FormProvider>
            </Grid2>
          </Box>
        </FormFieldset>
      )}
      {!timeseriesHasControlSettings && (
        <Box>
          <Button
            bttype="primary"
            startIcon={<AddCircleOutline color="primary" />}
            sx={{
              width: 'fit-content',
              backgroundColor: 'transparent',
              border: 'none',
              px: 0.5,
              ':hover': {
                backgroundColor: 'grey.200',
              },
            }}
            onClick={() => {
              setControlSettingIndex((prev) => [...prev, index]);
            }}
          >
            <Typography variant="body1" color="primary">
              Tilføj kontrolhyppighed
            </Typography>
          </Button>
        </Box>
      )}
    </>
  );
};

export default ControlSettingSection;
