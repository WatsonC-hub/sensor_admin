import {Box, MenuItem} from '@mui/material';
import React from 'react';
import {UseFormReturn} from 'react-hook-form';
import {createTypedForm} from '~/components/formComponents/Form';
// import FormFieldset from '~/components/formComponents/FormFieldset';
import {SyncFormValues} from '~/pages/field/station/stamdata/EditTimeseries';

type SyncFormProps = {
  formMethods: UseFormReturn<SyncFormValues>;
  loctype_id?: number | undefined;
  tstype_id?: number | undefined;
  owners?: {cvr: string; name: string}[];
};

const Form = createTypedForm<SyncFormValues>();

const SyncForm = ({formMethods, loctype_id, tstype_id, owners}: SyncFormProps) => {
  const isWaterLevel = tstype_id === 1;
  const isWaterCourseOrLake = loctype_id === 1 || loctype_id === 6;

  const {watch} = formMethods;
  const syncDmp = watch('sync_dmp');

  return (
    <Box display={'flex'} flexDirection={'column'} gap={1} mt={1}>
      {(isWaterCourseOrLake || isWaterLevel) && (
        <Form formMethods={formMethods} label="Synkronisering" gridSizes={12}>
          {isWaterCourseOrLake && (
            <>
              <Form.Checkbox name="sync_dmp" label="DMP" />
              <Form.Input
                select
                name="owner_name"
                label="Data ejer"
                disabled={!syncDmp}
                fullWidth={false}
              >
                <MenuItem value="" disabled>
                  Vælg data ejer
                </MenuItem>
                {owners?.map((owner) => (
                  <MenuItem key={owner.cvr} value={owner.name}>
                    {owner.name} ({owner.cvr})
                  </MenuItem>
                ))}
              </Form.Input>
            </>
          )}
          {loctype_id === 9 && isWaterLevel && <Form.Checkbox name="jupiter" label="Jupiter" />}
        </Form>
      )}
    </Box>
  );
};

export default SyncForm;
