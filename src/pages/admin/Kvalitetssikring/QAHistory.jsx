import React, {useContext} from 'react';
import {Typography, Box, Button} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';
import {MetadataContext} from 'src/state/contexts';

export default function QAHistory() {
  const metadata = useContext(MetadataContext);

  const {data} = useQuery(
    ['qa_all', metadata?.ts_id],
    async () => {
      const {data} = await apiClient.get(`/sensor_admin/qa_all/${metadata?.ts_id}`);
      return data;
    },
    {
      enabled: metadata?.ts_id !== undefined,
      refetchInterval: null,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  return <Box sx={{height: 270, flexGrow: 1}}>{JSON.stringify(data)}</Box>;
}
