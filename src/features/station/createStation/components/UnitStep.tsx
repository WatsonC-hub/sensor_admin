import dayjs from 'dayjs';
import React from 'react';
import {FormProvider} from 'react-hook-form';
import useUnitForm from '../../api/useUnitForm';
import DefaultUnitForm from '../../components/stamdata/stamdataComponents/DefaultUnitForm';
import StamdataUnit from '../../components/stamdata/StamdataUnit';
import {AddUnit} from '../../schema';
import useCreateStationContext from '../api/useCreateStationContext';
import FormStepButtons from './FormStepButtons';

const UnitStep = () => {
  const {meta, activeStep, setFormErrors, formState, onValidate, setMeta} =
    useCreateStationContext();

  const unitFormMethods = useUnitForm<AddUnit>({
    mode: 'Add',
    defaultValues: {
      startdate: dayjs(),
      unit_uuid: '',
    },
  });

  const {handleSubmit} = unitFormMethods;

  return (
    <>
      {activeStep === 1 && (
        <>
          <FormProvider {...unitFormMethods}>
            <StamdataUnit tstype_id={meta?.tstype_id}>
              <DefaultUnitForm
                onValidate={(sensortypeList) => {
                  if (sensortypeList === undefined || sensortypeList.length === 0) return;
                  if (formState.timeseries === undefined || formState.timeseries.length === 0) {
                    onValidate(
                      'timeseries',
                      sensortypeList.map((id) => ({
                        prefix: undefined,
                        intakeno: undefined,
                        tstype_id: id,
                      }))
                    );
                    setMeta((prev) => ({
                      ...prev,
                      tstype_id: sensortypeList,
                    }));
                  } else {
                    const indexList: Array<number> = [];
                    sensortypeList.forEach((tstype_id, index) => {
                      if (
                        formState.timeseries !== undefined &&
                        !formState.timeseries.map((ts) => ts.tstype_id).includes(tstype_id)
                      )
                        indexList.push(index);
                    });
                    const addedTimeseries = [
                      ...formState.timeseries.filter(
                        (ts) =>
                          ts.tstype_id !== undefined &&
                          ts.tstype_id !== null &&
                          sensortypeList.includes(ts.tstype_id)
                      ),
                      ...indexList.map((i) => {
                        if (
                          formState.timeseries !== undefined &&
                          formState.timeseries.length > 0 &&
                          formState.timeseries.length - 1 <= i
                        )
                          return {
                            prefix: formState.timeseries[i]?.prefix,
                            intakeno: formState.timeseries[i]?.intakeno,
                            tstype_id: sensortypeList[i],
                          };

                        return {
                          prefix: undefined,
                          intakeno: undefined,
                          tstype_id: sensortypeList[i],
                        };
                      }),
                    ];
                    onValidate('timeseries', addedTimeseries);
                    setMeta((prev) => ({
                      ...prev,
                      tstype_id: addedTimeseries
                        .filter((ts) => ts !== undefined && ts.tstype_id !== undefined)
                        .map((ts) => ts.tstype_id!),
                    }));
                  }
                }}
              />
            </StamdataUnit>
          </FormProvider>
          <FormStepButtons
            key={'unit'}
            onFormIsValid={async () => {
              let isValid = true;
              await handleSubmit(
                (data) => {
                  onValidate('unit', data);
                },
                (e) => {
                  setFormErrors((prev) => ({
                    ...prev,
                    unit: Object.keys(e).length > 0,
                  }));

                  isValid = false;
                }
              )();

              return isValid;
            }}
          />
        </>
      )}
    </>
  );
};

export default UnitStep;
