import {useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';

type MinimalSelectType = {
  ts_id: number;
  prefix: string;
  tstype_name: string;
};

const useStationList = (loc_id: number) => {
  const {data, error, isPending} = useQuery({
    queryKey: queryKeys.Location.minimalSelectList(loc_id),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<MinimalSelectType>>(
        `/sensor_field/station/ts_id_list/${loc_id}`
      );
      return data;
    },
    enabled: loc_id !== undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {data, error, isPending};
};

export default useStationList;
