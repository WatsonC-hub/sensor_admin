import {Box} from '@mui/material';
import React from 'react';
import {UseFormReturn} from 'react-hook-form';
import {createTypedForm} from '~/components/formComponents/Form';
import {SyncFormValues} from '~/pages/field/station/stamdata/EditTimeseries';

type SyncFormProps = {
  formMethods: UseFormReturn<SyncFormValues>;
  loctype_id?: number | undefined;
  tstype_id?: number | undefined;
};

const Form = createTypedForm<SyncFormValues>();

const SyncForm = ({formMethods, loctype_id, tstype_id}: SyncFormProps) => {
  const isWaterLevel = tstype_id === 1;
  return (
    <Box>
      <Form formMethods={formMethods} label="Synkronisering" gridSizes={12}>
        <Form.Checkbox name="dmp" label="DMP" />
        {loctype_id === 9 && isWaterLevel && <Form.Checkbox name="jupiter" label="Jupiter" />}
      </Form>
    </Box>
  );
};

export default SyncForm;
