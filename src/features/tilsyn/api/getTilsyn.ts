import {useQuery, queryOptions, QueryClientConfig} from '@tanstack/react-query';
import moment from 'moment';

import {apiClient} from '~/apiClient';
import {TilsynItem} from '~/types';

export const getTilsyn = async ({ts_id}: {ts_id: number}): Promise<TilsynItem[]> => {
  const {data} = await apiClient.get(`/sensor_field/station/service/${ts_id}`);
  return data;
};

export const getTilsynQueryOptions = (ts_id: number) => {
  return queryOptions({
    queryKey: ['service', ts_id],
    queryFn: async () => getTilsyn({ts_id}),
    select: (data) =>
      data.map((m: TilsynItem) => {
        return {...m, dato: moment(m.dato).format('YYYY-MM-DDTHH:mm')};
      }),
    enabled: ts_id !== -1 && ts_id !== null,
  });
};

type UseTilsynOptions = {
  ts_id: number;
  queryConfig?: QueryClientConfig;
};

export const useTilsyn = ({ts_id, queryConfig}: UseTilsynOptions) => {
  return useQuery({
    ...getTilsynQueryOptions(ts_id),
    ...queryConfig,
  });
};
