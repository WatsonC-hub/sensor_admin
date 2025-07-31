import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {Task, TaskAPI} from '../types';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import dayjs from 'dayjs';

const locationTaskHistoryOptions = (loc_id: number | undefined) =>
  queryOptions({
    queryKey: queryKeys.Tasks.closedTasks(loc_id),
    queryFn: async () => {
      const {data} = await apiClient.get<TaskAPI[]>(`/sensor_admin/tasks/closed/${loc_id}`);
      return data;
    },
    select: (data): Task[] =>
      data.map((task) => ({
        ...task,
        due_date: task.due_date ? dayjs(task.due_date) : null,
      })),
    enabled: false,
  });

const useLocationTaskHistory = (loc_id: number | undefined) => {
  return useQuery(locationTaskHistoryOptions(loc_id));
};

export default useLocationTaskHistory;
