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
  const {meta, activeStep, setFormErrors, onValidate} = useCreateStationContext();

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
      {activeStep === 2 && (
        <>
          <FormProvider {...unitFormMethods}>
            <StamdataUnit tstype_id={meta?.tstype_id}>
              <DefaultUnitForm />
            </StamdataUnit>
          </FormProvider>
          <FormStepButtons
            onFormIsValid={async () => {
              let isValid = true;
              await handleSubmit(
                (data) => {
                  console.log(data);
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
