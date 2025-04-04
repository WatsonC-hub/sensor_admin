import {useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';

type MinimalSelectType = {
  ts_id: number;
  prefix: string;
  tstype_name: string;
};

const useStationList = (loc_id: number) => {
  const {data, error, isPending} = useQuery({
    queryKey: ['tsList', loc_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<MinimalSelectType>>(
        `/sensor_field/station/ts_id_list/${loc_id}`
      );
      return data;
    },
    enabled: loc_id !== undefined,
  });

  return {data, error, isPending};
};

export default useStationList;
