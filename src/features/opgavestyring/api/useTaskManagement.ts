import {useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {TaskCollection} from '~/types';

export const useTaskManagement = (itinerary_id: string | null) => {
  const {data} = useQuery({
    queryKey: queryKeys.Itineraries.itineraryCollection(itinerary_id),
    queryFn: async () => {
      const {data} = await apiClient.get<TaskCollection>(
        `/sensor_admin/tasks/task_collection/${itinerary_id}`
      );
      return data;
    },
  });

  return data;
};
