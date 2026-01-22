import {Box} from '@mui/material';
import React, {useEffect, useState} from 'react';
import useCreateStationContext from '../api/useCreateStationContext';
import FormStepButtons from './FormStepButtons';
import Button from '~/components/Button';
import UnitDialog from './UnitDialog';

import {useRootFormController} from '../controller/useRootFormController';
import TimeseriesEditor from '../helper/TimeseriesEditor';
import FormFieldset from '~/components/formComponents/FormFieldset';
const TimeseriesStep = () => {
  const [unitDialog, setUnitDialog] = useState(false);
  const [ids, setIds] = useState<string[]>([]);

  const {activeStep} = useCreateStationContext();

  const {aggregate, removeTimeseries, registerTimeseries, validateAllSlices, timeseries} =
    useRootFormController();

  const addTimeseries = () => {
    setIds((ids) => [...ids, crypto.randomUUID()]);
  };

  useEffect(() => {
    if (ids.length === 0) {
      return;
    }

    aggregate.registerSlice('timeseries', true, async () => {
      console.log('Validating timeseries slice', timeseries);
      const allValid = Object.entries(timeseries).every(async ([id, ts]) => {
        console.log('Validating timeseries controller:', id, ts);
        return await ts.validateAllSlices();
      });

      return allValid;
    });
  }, [timeseries]);

  return (
    <>
      {activeStep === 1 && (
        <>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button bttype="primary" onClick={() => addTimeseries()}>
              Tilføj tidsserie
            </Button>
            <Button bttype="primary" onClick={() => setUnitDialog(true)}>
              Tilføj fra udstyr
            </Button>
          </Box>

          {ids.map((id, index) => {
            return (
              <FormFieldset
                key={id}
                label={'Tidsserie - ' + (index + 1)}
                labelPosition={-20}
                sx={{width: '100%', p: 1, gap: 2}}
              >
                <TimeseriesEditor
                  key={id}
                  onRegister={(controller) => registerTimeseries(id, controller)}
                  // onChange={(state) => updateTimeseries(id, state)}
                  onRemove={() => {
                    removeTimeseries(id);
                    setIds((ids) => ids.filter((x) => x !== id));
                  }}
                />
              </FormFieldset>
            );
          })}

          {/* {false && <WatlevmpSection controller={ts} />} */}
          {/* {timeseries?.map((field, index) => {
              // let isSyncAllowed = false;
              // const unit = timeseries?.[index].unit;

              // isSyncAllowed = isSynchronizationAllowed(
              //   field.tstype_id ?? undefined,
              //   meta?.loctype_id,
              //   dmpAllowedMapList
              // );

              return (
                <FormFieldset
                key={index}
                label={'Tidsserie - ' + (index + 1)}
                labelPosition={-20}
                sx={{width: '100%', p: 1, gap: 2}}
                >
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

                              // typeSelectChanged(
                              //   event as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
                              //   index,
                              //   field,
                              //   meta,
                              //   setMeta,
                              //   onValidate,
                              //   watlevmpIndex,
                              //   removeWatlevmpAtIndex,
                              //   timeseries
                              // );
                            },
                          },
                          intakeno: {
                            onChangeCallback: () => {
                              // const value = (
                              //   event as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
                              // ).target.value;
                              // update(index, {
                              //   ...field,
                              //   intakeno: parseInt(value),
                              // });
                              // onValidate('timeseries', getValues('timeseries'));
                            },
                          },
                        }}
                      />
                    </Grid2>
                  </StamdataTimeseries>
                  {field.tstype_id === 1 && (
                    <>
                      <WatlevmpSection
                        showAddWatlevmpButton={!timeseries?.[index].watlevmp}
                        index={index}
                        removeWatlevmpAtIndex={removeWatlevmpAtIndex}
                      />
                    </>
                  )}
                  {unit?.unit_uuid ? (
                    <UnitStep unit={unit} />
                  ) : (
                    field.tstype_id && (
                      <AddUnitSection field={field} index={index} update={update} />
                    )
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

                  {field?.tstype_id && meta?.loctype_id && isSyncAllowed && (
                    <SyncSection
                      index={index}
                      SyncIndex={timeseriesSyncList}
                      setSyncIndex={setTimeseriesSyncList}
                      removeSyncAtIndex={removeSyncAtIndex}
                      setValue={(value) => {
                        setValue(`timeseries.${index}.sync`, value);
                      }}
                      field={field}
                      update={update}
                    />
                  )}


                </FormFieldset>
              );
            })} */}
          <FormStepButtons
            key={'timeseries'}
            onFormIsValid={async () => {
              const isValid = await validateAllSlices();
              console.log('TimeseriesStep valid:', isValid);
              return false;
            }}
          />
          <UnitDialog
            open={unitDialog}
            onClose={() => setUnitDialog(false)}
            onValidate={() => {
              // onUnitListValidate(validate_units, onValidate, timeseries, units);
            }}
          />
        </>
      )}
    </>
  );
};

export default TimeseriesStep;
