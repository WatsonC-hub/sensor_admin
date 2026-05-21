import React from 'react';

import {useCreateStationStore} from '../state/useCreateStationStore';
import VisibilityForm from '../forms/VisibilityForm';
import FormFieldset from '~/components/formComponents/FormFieldset';

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
