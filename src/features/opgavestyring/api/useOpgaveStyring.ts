//TaskSupervision
//taskManagement
//opgaveStyring
import {useQueries} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';

import {useLocationData} from './useLocationData';
interface TaskManagement {
  loc_ids: Array<number>;
}

export const useTaskManagement = ({loc_ids}: TaskManagement) => {
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
      return {
        data: results.map((result) => result.data).flat(),
        pending: results.some((result) => result.isPending),
        ts_ids: unique_ts_ids,
      };
    },
  });
  const {data} = get;

  const {
    getService: {data: serviceData},
    getPejling: {data: pejlingData},
  } = useLocationData(get);

  console.log(data);
  console.log(get);
  console.log(serviceData);
  console.log(pejlingData);

  return {get};
};
