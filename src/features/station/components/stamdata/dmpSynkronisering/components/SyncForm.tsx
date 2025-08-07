import {Box, MenuItem} from '@mui/material';
import React from 'react';
import {UseFormReturn} from 'react-hook-form';
import {createTypedForm} from '~/components/formComponents/Form';
// import FormFieldset from '~/components/formComponents/FormFieldset';
import {SyncFormValues} from '~/pages/field/station/stamdata/EditTimeseries';
import useSync from '../api/useSync';

type SyncFormProps = {
  formMethods: UseFormReturn<SyncFormValues>;
  loctype_id?: number | undefined;
  tstype_id?: number | undefined;
  owners?: {cvr: string; name: string}[];
};

const Form = createTypedForm<SyncFormValues>();

const SyncForm = ({formMethods, loctype_id, tstype_id, owners}: SyncFormProps) => {
  const isJupiterType = [1, 11, 12, 16].includes(tstype_id || 0);
  const isDmpType = [1, 2, 8, 11].includes(tstype_id || 0);
  const isWaterCourseOrLake = loctype_id === 1 || loctype_id === 6;
  const isBorehole = loctype_id === 9;

  const canSyncDmp =
    (isWaterCourseOrLake && isDmpType) || (isBorehole && isDmpType && isJupiterType);
  const canSyncJupiter = isBorehole && isJupiterType;

  const {
    get: {data: db_data},
  } = useSync();

  const {watch} = formMethods;
  const syncDmp = watch('sync_dmp');

  return (
    <Box display={'flex'} flexDirection={'column'} gap={1} mt={1}>
      {(canSyncDmp || canSyncJupiter) && (
        <Form formMethods={formMethods} label="Synkronisering" gridSizes={12}>
          {canSyncDmp && (
            <>
              <Form.Checkbox name="sync_dmp" label="DMP" disabled={db_data?.sync_dmp} />
              <Form.Input
                select
                name="owner_name"
                label="Data ejer"
                disabled={!syncDmp || db_data?.sync_dmp}
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
          {canSyncJupiter && <Form.Checkbox name="jupiter" label="Jupiter" />}
        </Form>
      )}
    </Box>
  );
};

export default SyncForm;
