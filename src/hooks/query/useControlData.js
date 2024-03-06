import {useQuery} from '@tanstack/react-query';
import {useContext} from 'react';
import {apiClient} from '~/apiClient';
import {MetadataContext} from '~/state/contexts';

export const useControlData = () => {
  const metadata = useContext(MetadataContext);

  const query = useQuery({
    queryKey: ['controls', metadata?.ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get(
        `/sensor_field/station/measurements/${metadata?.ts_id}?useReference=true`
      );
      return data;
    },
    enabled: typeof metadata?.ts_id == 'number',
    refetchInterval: null,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  return query;
};
