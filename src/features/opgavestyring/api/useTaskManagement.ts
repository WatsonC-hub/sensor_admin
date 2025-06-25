import {useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {PejlingItem, TaskCollection, TilsynItem} from '~/types';

export const useTaskManagement = (itinerary_id: string | null) => {
  const {data} = useQuery({
    queryKey: ['tasks', itinerary_id],
    queryFn: async () => {
      const {data} = await apiClient.get<TaskCollection>(
        `/sensor_admin/tasks/task_collection/${itinerary_id}`,
        {}
      );
      return data;
    },
    enabled: itinerary_id !== undefined && itinerary_id !== null,
  });

  // const get = useQueries({
  //   queries: loc_ids.map((loc_id) => ({
  //     queryKey: ['stations', loc_id],
  //     queryFn: async () => {
  //       const {data} = await apiClient.get(`/sensor_field/station/metadata_location/${loc_id}`);
  //       return data;
  //     },
  //     enabled: loc_id !== undefined,
  //     placeholderData: [],
  //   })),
  //   combine: (results) => {
  //     const unique_ts_ids: Array<number> = [
  //       ...new Set(results.map((result) => result.data.map((elem: {ts_id: number}) => elem.ts_id))),
  //     ];

  //     return {
  //       data: results.map((result) => result.data).flat(),
  //       pending: results.some((result) => result.isPending),
  //       ts_ids: unique_ts_ids,
  //     };
  //   },
  // });

  // const {
  //   getService: {data: serviceData},
  //   getPejling: {data: pejlingData},
  // } = useLocationData(get);
  const serviceData: TilsynItem[] = [];
  const pejlingData: PejlingItem[] = [];

  return {serviceData, pejlingData, data};
};
