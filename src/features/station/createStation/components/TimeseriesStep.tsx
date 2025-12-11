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
import WatlevmpForm from './WatlevmpForm';
const TimeseriesStep = () => {
  const {isMobile} = useBreakpoints();
  const [unitDialog, setUnitDialog] = useState(false);
  const size = isMobile ? 12 : 5.5;
  const {
    meta,
    setMeta,
    onValidate,
    setFormErrors,
    formState: {timeseries},
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
    control,
  } = timeseriesFormMethods;

  const {fields, append, remove, update} = useFieldArray({
    control,
    name: 'timeseries',
  });

  useEffect(() => {
    const timeseriesInvalid = Object.keys(timeseriesFormState.errors).length > 0;
    setFormErrors((prev) => ({
      ...prev,
      timeseries: timeseriesInvalid,
    }));

    if (meta?.tstype_id?.includes(1)) {
      setFormErrors((prev) => ({
        ...prev,
        timeseries: timeseriesInvalid,
      }));
    }
  }, [timeseriesFormState.errors]);

  return (
    <>
      {activeStep === 1 && (
        <>
          <FormProvider {...timeseriesFormMethods}>
            <Box>
              <Button
                bttype="primary"
                sx={{maxWidth: 200, mr: 1}}
                onClick={() =>
                  append({
                    prefix: undefined,
                    intakeno: undefined,
                    tstype_id: undefined,
                  })
                }
              >
                Tilføj tidsserie
              </Button>
              <Button bttype="primary" onClick={() => setUnitDialog(true)}>
                Tilføj fra udstyr
              </Button>
            </Box>
            {fields?.map((field, index) => {
              console.log('Rendering timeseries field:', field, index);
              return (
                <FormFieldset
                  key={field.id}
                  label={'tidsserie - ' + (field.sensor_id ? field.sensor_id : index + 1)}
                  sx={{width: '100%'}}
                >
                  <StamdataTimeseries key={field.id} boreholeno={meta?.boreholeno}>
                    <Grid2 container size={12} spacing={1}>
                      <TimeseriesForm
                        size={size}
                        loc_name={meta?.loc_name}
                        required
                        formPrefix={`timeseries.${index}.`}
                        slotProps={{
                          TypeSelect: {
                            onChangeCallback: (event) => {
                              const value = (
                                event as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
                              ).target.value;
                              const existingTstypeIds = [...(meta?.tstype_id || [])];

                              const tstypeIndex = existingTstypeIds.findIndex(
                                (_, i) => i === index
                              );
                              if (tstypeIndex !== -1) {
                                existingTstypeIds[tstypeIndex] = parseInt(value);
                              } else {
                                existingTstypeIds.push(parseInt(value));
                              }
                              setMeta((prev) => ({
                                ...prev,
                                tstype_id: existingTstypeIds,
                              }));
                            },
                          },
                          intakeno: {
                            onChangeCallback: (event) => {
                              const value = (
                                event as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
                              ).target.value;
                              // find the timeseries in the timeseries array and update its intakeno
                              const existingTimeseries = [...(timeseries || [])];
                              if (existingTimeseries[index]) {
                                existingTimeseries[index].intakeno = parseInt(value);
                                update(index, existingTimeseries[index]);
                                onValidate('timeseries', existingTimeseries);
                              }
                            },
                          },
                        }}
                      />
                      <Grid2
                        size={isMobile ? 12 : 1}
                        alignContent={'center'}
                        display={isMobile ? 'flex' : undefined}
                        justifyContent={isMobile ? 'end' : undefined}
                      >
                        <Button
                          bttype="tertiary"
                          sx={{marginTop: 1}}
                          startIcon={isMobile ? <Delete /> : undefined}
                          onClick={() => {
                            remove(index);
                            const updatedTstypeIds = meta?.tstype_id?.filter((_, i) => i !== index);
                            setMeta((prev) => ({
                              ...prev,
                              tstype_id: updatedTstypeIds,
                            }));
                            onValidate(
                              'timeseries',
                              timeseries?.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          {!isMobile ? <Delete /> : 'Fjern tidsserie'}
                        </Button>
                      </Grid2>
                    </Grid2>
                  </StamdataTimeseries>
                  {field.tstype_id === 1 && (
                    <WatlevmpForm
                      tstype_id={field.tstype_id}
                      intakeno={field.intakeno ?? undefined}
                    />
                  )}
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
                  onValidate('timeseries', data.timeseries);
                },
                (e) => {
                  onValidate('timeseries', null);
                  console.log(e);
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
            onValidate={(units) => {
              const unit_timeseries = units.map((unit) => ({
                prefix: undefined,
                intakeno: undefined,
                tstype_id: unit.sensortypeid,
                unit_uuid: unit.unit_uuid,
                sensor_id: unit.sensor_id,
              }));

              // append(unit_timeseries);

              onValidate('timeseries', [...(timeseries || []), ...unit_timeseries]);
              setUnitDialog(false);
            }}
          />
        </>
      )}
    </>
  );
};

export default TimeseriesStep;
