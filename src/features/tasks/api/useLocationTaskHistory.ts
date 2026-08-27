import {queryOptions, useQuery} from '@tanstack/react-query';
import dayjs from 'dayjs';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/queryKeyFactoryHelper';

import type {TaskAPI} from '../types';

const locationTaskHistoryOptions = (loc_id: number | undefined) =>
  queryOptions({
    queryKey: queryKeys.Tasks.closedTasks(loc_id),
    queryFn: async () => {
      const {data} = await apiClient.get<TaskAPI[]>(`/sensor_admin/tasks/closed/${loc_id}`);
      return data.map((task) =>
        Object.assign(task, {due_date: task.due_date ? dayjs(task.due_date) : null})
      );
    },
    enabled: false,
  });

const useLocationTaskHistory = (loc_id: number | undefined) => {
  return useQuery(locationTaskHistoryOptions(loc_id));
};

export default useLocationTaskHistory;
