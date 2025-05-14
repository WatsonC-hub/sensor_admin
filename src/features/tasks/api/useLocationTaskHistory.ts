import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {Task} from '../types';

export const locationTaskHistoryOptions = (loc_id: number) =>
  queryOptions({
    queryKey: ['closed_tasks', loc_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Task[]>(`/sensor_admin/tasks/closed/${loc_id}`);
      return data;
    },
    staleTime: 1000 * 60 * 60,
    enabled: false,
  });

const useLocationTaskHistory = (loc_id: number) => {
  return useQuery(locationTaskHistoryOptions(loc_id));
};

export default useLocationTaskHistory;
