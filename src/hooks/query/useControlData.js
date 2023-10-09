import {useQuery} from '@tanstack/react-query';
import {useContext} from 'react';
import {apiClient} from 'src/apiClient';
import {MetadataContext} from 'src/state/contexts';

export const useControlData = () => {
  const metadata = useContext(MetadataContext);

  const query = useQuery(
    ['controls', metadata?.ts_id],
    async () => {
      const {data} = await apiClient.get(
        `/sensor_field/station/measurements/${metadata?.ts_id}?useReference=true`
      );
      return data;
    },
    {
      enabled: typeof metadata?.ts_id == 'number',
      refetchInterval: null,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    }
  );

  return query;
};
