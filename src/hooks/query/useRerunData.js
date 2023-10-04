import {useContext} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {apiClient} from 'src/apiClient';
import {MetadataContext} from 'src/state/contexts';

export const useRerunData = () => {
  const metadata = useContext(MetadataContext);

  const query = useQuery(
    ['qa_all', metadata?.ts_id],
    async () => {
      const {data} = await apiClient.get(`/sensor_admin/qa_all/${metadata?.ts_id}`);
      return data;
    },
    {
      enabled: typeof metadata?.ts_id == 'number',
      refetchInterval: null,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  return query;
};
