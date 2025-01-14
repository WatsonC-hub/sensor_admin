import {useQueries, useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {TaskCollection} from '~/types';

import {useLocationData} from './useLocationData';

interface TaskManagement {
  loc_ids: Array<number>;
}

export const useTaskManagement = ({loc_ids}: TaskManagement) => {
  const {data} = useQuery({
    queryKey: ['tasks', loc_ids],
    queryFn: async () => {
      const {data} = await apiClient.get<TaskCollection>(`/sensor_admin/tasks/task_collection`, {
        params: {
          loc_ids: JSON.stringify(loc_ids),
        },
      });
      return data;
    },
    enabled: loc_ids !== undefined && loc_ids !== null && loc_ids.length > 0,
  });

  const get = useQueries({
    queries: loc_ids.map((loc_id) => ({
      queryKey: ['stations', loc_id],
      queryFn: async () => {
        const {data} = await apiClient.get(`/sensor_field/station/metadata_location/${loc_id}`);
        return data;
      },
      enabled: loc_id !== undefined,
      placeholderData: [],
    })),
    combine: (results) => {
      const unique_ts_ids: Array<number> = [
        ...new Set(results.map((result) => result.data.map((elem: {ts_id: number}) => elem.ts_id))),
      ];
      console.log(unique_ts_ids);

      return {
        data: results.map((result) => result.data).flat(),
        pending: results.some((result) => result.isPending),
        ts_ids: unique_ts_ids,
      };
    },
  });

  const {
    getService: {data: serviceData},
    getPejling: {data: pejlingData},
  } = useLocationData(get);

  return {serviceData, pejlingData, data};
};
