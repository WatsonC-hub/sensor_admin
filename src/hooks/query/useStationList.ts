import {useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';

type minimalSelectType = {
  ts_id: number;
  prefix: string;
  tstype_name: string;
};

const useStationList = (loc_id: number) => {
  const {
    data: ts_list,
    error,
    isPending,
  } = useQuery({
    queryKey: ['tsList', loc_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<minimalSelectType>>(
        `/sensor_field/station/ts_id_list/${loc_id}`
      );
      return data;
    },
    enabled: loc_id !== undefined,
  });

  return {ts_list, error, isPending};
};

export default useStationList;
