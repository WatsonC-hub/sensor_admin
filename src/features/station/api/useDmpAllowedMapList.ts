import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {useUser} from '~/features/auth/useUser';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {queryClient} from '~/queryClient';
import {DmpSyncValidCombination} from '~/types';

const getDmpAllowedMapList = queryOptions({
  queryKey: queryKeys.dmpAllowedMapList(),
  queryFn: async () => {
    const {data} = await apiClient.get<Array<DmpSyncValidCombination>>(
      `/sensor_field/stamdata/sync/dmp/sync-allowed`
    );
    return data;
  },
  staleTime: 1000 * 60 * 60 * 12, // 12 hour
});

export const prefetchDmpAllowedMapList = async () => {
  await queryClient.ensureQueryData(getDmpAllowedMapList);
};

const useDmpAllowedMapList = (ts_id: number) => {
  const {data: metadata} = useTimeseriesData(ts_id);

  const {data: dmpAllowedMap} = useQuery(getDmpAllowedMapList);

  const {superUser} = useUser();

  if (!superUser) return false;

  if (!metadata || !dmpAllowedMap) return null;

  const isDmpAllowed = dmpAllowedMap.some((combination) => {
    return (
      combination.loctype_id === metadata.loctype_id && combination.tstype_id === metadata.tstype_id
    );
  });

  return isDmpAllowed;
};

export default useDmpAllowedMapList;
