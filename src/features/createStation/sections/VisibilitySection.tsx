import React from 'react';

import FormFieldset from '~/components/formComponents/FormFieldset';

import VisibilityForm from '../forms/VisibilityForm';
import {useCreateStationStore} from '../state/useCreateStationStore';

const VisibilitySection = () => {
  const [setState, visibility] = useCreateStationStore((state) => [
    state.setState,
    state.formState.location?.visibility,
  ]);

  return (
    <FormFieldset label="Tilgængelighed" sx={{width: '100%', p: 1}}>
      <VisibilityForm
        visibility={visibility}
        setValues={(value) => {
          setState(`location.visibility`, value);
        }}
      />
    </FormFieldset>
  );
};

export default VisibilitySection;
