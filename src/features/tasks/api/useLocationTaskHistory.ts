import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {Task} from '../types';

export const locationTaskHistoryOptions = (loc_id: number | undefined) =>
  queryOptions({
    queryKey: ['closed_tasks', loc_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Task[]>(`/sensor_admin/tasks/closed/${loc_id}`);
      return data;
    },
    enabled: false,
  });

const useLocationTaskHistory = (loc_id: number | undefined) => {
  return useQuery(locationTaskHistoryOptions(loc_id));
};

export default useLocationTaskHistory;
