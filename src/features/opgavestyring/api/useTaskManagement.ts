import {useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {PejlingItem, TaskCollection, TilsynItem} from '~/types';

export const useTaskManagement = (itinerary_id: string | null) => {
  const {data} = useQuery({
    queryKey: [queryKeys.Tasks.byItinerary(itinerary_id)],
    queryFn: async () => {
      const {data} = await apiClient.get<TaskCollection>(
        `/sensor_admin/tasks/task_collection/${itinerary_id}`,
        {}
      );
      return data;
    },
    enabled: itinerary_id !== undefined && itinerary_id !== null,
  });

  const serviceData: TilsynItem[] = [];
  const pejlingData: PejlingItem[] = [];

  return {serviceData, pejlingData, data};
};
