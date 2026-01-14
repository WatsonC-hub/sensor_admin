import {Box, Grid2} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {FormProvider, useFieldArray} from 'react-hook-form';
import useBreakpoints from '~/hooks/useBreakpoints';
import useTimeseriesForm from '../../api/useTimeseriesForm';
import StamdataTimeseries from '../../components/stamdata/StamdataTimeseries';
import useCreateStationContext from '../api/useCreateStationContext';
import FormStepButtons from './FormStepButtons';
import Button from '~/components/Button';
import {Delete} from '@mui/icons-material';
import FormFieldset from '~/components/formComponents/FormFieldset';
import UnitDialog from './UnitDialog';
import UnitStep from './UnitStep';

import {
  onUnitListValidate,
  removeTimeseries,
  typeSelectChanged,
} from '../helper/TimeseriesStepHelper';
import WatlevmpSection from './WatlevmpSection';
import ControlSettingSection from './ControlSettingSection';
import AddUnitSection from './AddUnitSection';
const TimeseriesStep = () => {
  const {isMobile} = useBreakpoints();
  const [unitDialog, setUnitDialog] = useState(false);
  const [watlevmpIndex, setWatlevmpIndex] = useState<Array<number>>([]);
  const [controlSettings, setControlSettings] = useState<Array<number>>([]);
  const size = isMobile ? 12 : 6;
  const {
    meta,
    setMeta,
    onValidate,
    setFormErrors,
    formState: {timeseries, watlevmp, units},
    activeStep,
  } = useCreateStationContext();
  const [timeseriesFormMethods, TimeseriesForm] = useTimeseriesForm({
    formProps: {
      context: {
        loctype_id: meta?.loctype_id,
      },
      values: {timeseries: timeseries},
    },
    mode: 'Add',
  });

  const {
    handleSubmit: handleTimeseriesSubmit,
    formState: timeseriesFormState,
    setValue,
    getValues,
    control,
  } = timeseriesFormMethods;

  const {fields, append, remove, update} = useFieldArray({
    control,
    name: 'timeseries',
  });

  const removeWatlevmpAtIndex = (index: number) => {
    const indexInWatlevmp = watlevmpIndex.find((i) => i === index);
    setWatlevmpIndex((prev) => prev.filter((i) => i !== index));
    onValidate(
      'watlevmp',
      (watlevmp || []).filter((_, i) => i !== indexInWatlevmp)
    );
  };

  const removeControlSettingsAtIndex = (index: number) => {
    setControlSettings((prev) => prev.filter((i) => i !== index));
    onValidate('control_settings', undefined, index);
  };

  useEffect(() => {
    const timeseriesInvalid = Object.keys(timeseriesFormState.errors).length > 0;
    setFormErrors((prev) => ({
      ...prev,
      timeseries: timeseriesInvalid,
    }));
  }, [timeseriesFormState.errors]);

  return (
    <>
      {activeStep === 1 && (
        <>
          <FormProvider {...timeseriesFormMethods}>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                bttype="primary"
                onClick={() => {
                  const append_timeseries = {
                    prefix: undefined,
                    intakeno: undefined,
                    tstype_id: undefined,
                  };
                  append(append_timeseries);
                  onValidate('timeseries', [...(timeseries || []), append_timeseries]);
                }}
              >
                Tilføj tidsserie
              </Button>
              <Button bttype="primary" onClick={() => setUnitDialog(true)}>
                Tilføj fra udstyr
              </Button>
            </Box>
            {fields?.map((field, index) => {
              const unit = units?.find((u) => u.unit_uuid === field.unit_uuid);
              return (
                <FormFieldset key={field.id} label="" sx={{width: '100%'}}>
                  <StamdataTimeseries boreholeno={meta?.boreholeno}>
                    <Grid2 container size={12} spacing={1}>
                      <TimeseriesForm
                        size={size}
                        loc_name={meta?.loc_name}
                        required
                        formPrefix={`timeseries.${index}.`}
                        slotProps={{
                          TypeSelect: {
                            onChangeCallback: (event) => {
                              typeSelectChanged(
                                event as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
                                index,
                                field,
                                meta,
                                setMeta,
                                onValidate,
                                units,
                                update,
                                watlevmpIndex,
                                removeWatlevmpAtIndex,
                                getValues
                              );
                            },
                          },
                          intakeno: {
                            onChangeCallback: (event) => {
                              const value = (
                                event as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
                              ).target.value;

                              update(index, {
                                ...field,
                                intakeno: parseInt(value),
                              });

                              onValidate('timeseries', getValues('timeseries'));
                            },
                          },
                        }}
                      />
                    </Grid2>
                  </StamdataTimeseries>
                  {field.tstype_id === 1 && (
                    <>
                      <WatlevmpSection
                        showAddWatlevmpButton={!watlevmpIndex.includes(index)}
                        index={index}
                        field={field}
                        removeWatlevmpAtIndex={removeWatlevmpAtIndex}
                        setWatlevmpIndex={setWatlevmpIndex}
                      />
                    </>
                  )}
                  {unit?.unit_uuid ? (
                    <UnitStep unit={unit} />
                  ) : (
                    <AddUnitSection field={field} index={index} update={update} />
                  )}

                  <ControlSettingSection
                    index={index}
                    controlSettingIndex={controlSettings}
                    setControlSettingIndex={setControlSettings}
                    removeControlSettingsAtIndex={removeControlSettingsAtIndex}
                    setValue={(key, value) => {
                      setValue(`timeseries.${index}.control_settings.${key}`, value);
                    }}
                    field={field}
                    update={update}
                  />

                  <Grid2
                    size={isMobile ? 12 : 1}
                    alignContent={'center'}
                    display={'flex'}
                    width={'100%'}
                    justifyContent={'end'}
                  >
                    <Button
                      bttype="tertiary"
                      startIcon={<Delete />}
                      onClick={() => {
                        removeTimeseries(
                          index,
                          field,
                          meta,
                          setMeta,
                          onValidate,
                          timeseries,
                          units,
                          remove
                        );

                        removeWatlevmpAtIndex(index);
                        removeControlSettingsAtIndex(index);
                      }}
                    >
                      Fjern tidsserie
                    </Button>
                  </Grid2>
                </FormFieldset>
              );
            })}
          </FormProvider>
          <FormStepButtons
            key={'timeseries'}
            onFormIsValid={async () => {
              let isValid = true;
              await handleTimeseriesSubmit(
                (data) => {
                  timeseries?.forEach((ts, index) => {
                    update(index, {
                      ...ts,
                      ...data.timeseries?.[index],
                    });
                  });

                  onValidate('timeseries', data.timeseries);
                },
                (e) => {
                  console.log(e);
                  onValidate('timeseries', null);
                  setFormErrors((prev) => ({
                    ...prev,
                    timeseries: Object.keys(e).length > 0,
                  }));

                  isValid = Object.keys(e).length === 0;
                }
              )();

              return isValid;
            }}
          />
          <UnitDialog
            open={unitDialog}
            onClose={() => setUnitDialog(false)}
            onValidate={(validate_units) => {
              onUnitListValidate(validate_units, onValidate, timeseries, units);
            }}
          />
        </>
      )}
    </>
  );
};

export default TimeseriesStep;
