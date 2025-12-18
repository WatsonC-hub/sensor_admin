import {Box, Grid2, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {FormProvider, useFieldArray} from 'react-hook-form';
import useBreakpoints from '~/hooks/useBreakpoints';
import useTimeseriesForm from '../../api/useTimeseriesForm';
import StamdataTimeseries from '../../components/stamdata/StamdataTimeseries';
import useCreateStationContext from '../api/useCreateStationContext';
import FormStepButtons from './FormStepButtons';
import Button from '~/components/Button';
import {AddCircleOutline, Delete} from '@mui/icons-material';
import FormFieldset from '~/components/formComponents/FormFieldset';
import UnitDialog from './UnitDialog';
import WatlevmpForm from './WatlevmpForm';
import AddUnitForm from '~/features/stamdata/components/stamdata/AddUnitForm';
import UnitStep from './UnitStep';
const TimeseriesStep = () => {
  const {isMobile} = useBreakpoints();
  const [unitDialog, setUnitDialog] = useState(false);
  const [watlevmpIndex, setWatlevmpIndex] = useState<Array<number>>([]);
  const [openUnitDialog, setOpenUnitDialog] = useState(false);
  const size = isMobile ? 12 : 6;
  const {
    meta,
    setMeta,
    onValidate,
    setFormErrors,
    formState: {timeseries, watlevmp, units},
    activeStep,
  } = useCreateStationContext();

  const sx = {
    width: 'fit-content',
    backgroundColor: 'transparent',
    border: 'none',
    ':hover': {
      backgroundColor: 'grey.200',
    },
  };

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

  const removeWatlevmpAtIndex = (index: number) => {
    const indexInWatlevmp = watlevmpIndex.find((i) => i === index);
    setWatlevmpIndex((prev) => prev.filter((i) => i !== index));
    onValidate(
      'watlevmp',
      (watlevmp || []).filter((_, i) => i !== indexInWatlevmp)
    );
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

                              update(index, {
                                ...field,
                                tstype_id: parseInt(value),
                              });

                              setMeta((prev) => ({
                                ...prev,
                                tstype_id: existingTstypeIds,
                              }));

                              if (value != '1' && watlevmpIndex.includes(index)) {
                                removeWatlevmpAtIndex(index);
                              }
                            },
                          },
                          intakeno: {
                            onChangeCallback: (event) => {
                              const value = (
                                event as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
                              ).target.value;
                              // find the timeseries in the timeseries array and update its intakeno
                              update(index, {
                                ...field,
                                intakeno: parseInt(value),
                              });
                            },
                          },
                        }}
                      />
                    </Grid2>
                  </StamdataTimeseries>
                  {field.tstype_id === 1 && (
                    <>
                      {watlevmpIndex.includes(index) ? (
                        <Grid2
                          container
                          size={12}
                          display={isMobile ? 'flex' : undefined}
                          justifyContent={isMobile ? 'end' : undefined}
                        >
                          <WatlevmpForm
                            index={index}
                            tstype_id={field.tstype_id}
                            intakeno={field.intakeno ?? undefined}
                            onValidate={onValidate}
                          />

                          <Button
                            bttype="tertiary"
                            startIcon={<Delete />}
                            sx={{height: 'fit-content', alignSelf: 'center', ml: 1}}
                            onClick={() => {
                              removeWatlevmpAtIndex(index);
                            }}
                          >
                            Fjern målepunkt
                          </Button>
                        </Grid2>
                      ) : (
                        <Box
                          display={isMobile ? 'flex' : undefined}
                          justifyContent={isMobile ? 'end' : undefined}
                        >
                          <Button
                            bttype="primary"
                            sx={sx}
                            onClick={() => {
                              setWatlevmpIndex((prev) => [...prev, index]);
                            }}
                          >
                            <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
                              <Typography variant="body1" color="primary">
                                Tilføj målepunkt
                              </Typography>
                              <AddCircleOutline color="primary" />
                            </Box>
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                  {unit?.unit_uuid ? (
                    <UnitStep unit={unit} />
                  ) : (
                    <Box
                      display={isMobile ? 'flex' : undefined}
                      justifyContent={isMobile ? 'end' : undefined}
                    >
                      <Button bttype="primary" sx={sx} onClick={() => setOpenUnitDialog(true)}>
                        <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
                          <Typography variant="body1" color="primary">
                            Tilføj udstyr
                          </Typography>
                          <AddCircleOutline color="primary" />
                        </Box>
                      </Button>
                      {openUnitDialog && (
                        <AddUnitForm
                          mode="add"
                          udstyrDialogOpen={openUnitDialog}
                          tstype_id={field.tstype_id ?? undefined}
                          setUdstyrDialogOpen={setOpenUnitDialog}
                          onValidate={(unit) => {
                            const updated_units = [...(units || []), unit];
                            onValidate('units', updated_units);
                            update(index, {
                              ...field,
                              unit_uuid: unit.unit_uuid,
                            });
                          }}
                        />
                      )}
                    </Box>
                  )}
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
                        removeWatlevmpAtIndex(index);
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
                  onValidate('timeseries', data.timeseries);
                },
                (e) => {
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
            onValidate={(units) => {
              const unit_timeseries = units.map((unit) => ({
                prefix: undefined,
                intakeno: undefined,
                tstype_id: unit.sensortypeid,
                unit_uuid: unit.unit_uuid,
                sensor_id: unit.sensor_id,
              }));

              // instead of adding a new timeseries, check first if the unit's sensortypeid already exists in timeseries and only add it if it doesn't, otherwise update the existing timeseries to have the unit_uuid and sensor_id of the unit being added
              // unit_timeseries.forEach((uts) => {
              //   const existingIndex = (timeseries || []).findIndex(
              //     (ts) => ts.tstype_id === uts.tstype_id
              //   );
              //   if (existingIndex !== -1) {
              //     update(existingIndex, {
              //       ...timeseries![existingIndex],
              //       unit_uuid: uts.unit_uuid,
              //       sensor_id: uts.sensor_id,
              //     });
              //   } else {
              //     append(uts);
              //   }
              // });

              const updated_timeseries = [...(timeseries || []), ...unit_timeseries];
              onValidate('timeseries', updated_timeseries);
              onValidate('units', units);
              setUnitDialog(false);
            }}
          />
        </>
      )}
    </>
  );
};

export default TimeseriesStep;
