import React from 'react';
import FormFieldset from '~/components/formComponents/FormFieldset';
import SlaForm from '../forms/SlaForm';
import {useCreateStationStore} from '../state/useCreateStationStore';

const SlaSection = () => {
  const [setState] = useCreateStationStore((state) => [state.setState]);

  return (
    <FormFieldset label="SLA (Service Level Agreement)" sx={{width: '100%', p: 1}}>
      <SlaForm
        setValues={(values) => {
          setState('location.sla', values);
        }}
      />
    </FormFieldset>
  );
};

export default SlaSection;
