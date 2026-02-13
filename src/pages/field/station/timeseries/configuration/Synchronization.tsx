import React from 'react';
import useSync from '~/features/station/components/stamdata/dmpSynkronisering/api/useSync';
import {useAppContext} from '~/state/contexts';
import {Box, Typography} from '@mui/material';
import {SyncFormValues} from '~/features/synchronization/api/useSyncForm';
import JupiterDmpSync from '~/features/synchronization/components/JupiterDmpSync';
import {useLocationData, useTimeseriesData} from '~/hooks/query/useMetadata';

const Synchronization = () => {
  const {ts_id, loc_id} = useAppContext(['loc_id', 'ts_id']);
  const {data: metadata} = useTimeseriesData(ts_id);
  const {data: location_data} = useLocationData(loc_id);

  const {
    get: {data: sync_data},
    post: postSync,
  } = useSync();

  const submit = (data: SyncFormValues) => {
    const syncPayload = {
      path: `${ts_id}`,
      data: data,
    };

    postSync.mutate(syncPayload);
  };

  return (
    <Box display={'flex'} flexGrow={1} flexDirection="column" justifyContent={'space-between'}>
      <Typography variant="subtitle1" marginBottom={1}>
        Synkronisering
      </Typography>
      <JupiterDmpSync
        loctype_id={location_data?.loctype_id}
        tstype_id={metadata?.tstype_id}
        values={sync_data}
        submit={submit}
        ts_id={ts_id}
      />
    </Box>
  );
};

export default Synchronization;
