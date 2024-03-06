import {useQuery} from '@tanstack/react-query';
import {useContext} from 'react';
import {apiClient} from '~/apiClient';
// @ts-ignore
import {MetadataContext} from '~/state/contexts';

export const useAdjustmentData = () => {
  const metadata = useContext(MetadataContext);

  if (!metadata) {
    return;
  }

  const query = useQuery({
    queryKey: ['qa_all', metadata?.ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_admin/qa_all/${metadata?.ts_id}`);
      return data;
    },
    enabled: typeof metadata?.ts_id == 'number',
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return query;
};
