import {queryOptions, useMutation, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {APIError} from '~/queryClient';
import {ActivityOption, ActivityPost, ActivityRow} from './types';

const activityOptionsQueryOptions = (ts_id?: number) =>
  queryOptions<ActivityOption[], APIError>({
    queryKey: queryKeys.Activity.options(ts_id),
    queryFn: async () => {
      const {data} = await apiClient.get<ActivityOption[]>(
        `/sensor_field/station/activity/options/${ts_id ?? ''}`
      );

      return data;
    },
  });

const allActivityOptionsQueryOptions = queryOptions<ActivityOption[], APIError>({
  queryKey: queryKeys.Activity.allOptions(),
  queryFn: async () => {
    const {data} = await apiClient.get<ActivityOption[]>(
      `/sensor_field/station/activity/all_options`
    );

    return data;
  },
});

const activityQueryOptions = (loc_id: number, ts_id?: number) =>
  queryOptions<ActivityRow[], APIError>({
    queryKey: queryKeys.Activity.activities(loc_id, ts_id),
    queryFn: async () => {
      const {data} = await apiClient.get<ActivityRow[]>(
        `/sensor_field/station/activity/${loc_id}/${ts_id ?? ''}`
      );

      return data;
    },
  });

export const commentPostOptions = {
  mutationKey: ['activity_comment_post'],
  mutationFn: async (data: ActivityPost) => {
    const {data: res} = await apiClient.post(`/sensor_field/station/activity/`, data);
    return res;
  },
};

const useActivityOptions = (ts_id?: number) => {
  return useQuery(activityOptionsQueryOptions(ts_id));
};

const useAllActivityOptions = () => {
  return useQuery(allActivityOptionsQueryOptions);
};

const useActivities = (loc_id: number, ts_id?: number) => {
  return useQuery(activityQueryOptions(loc_id, ts_id));
};

const useActivityPost = () => {
  return useMutation(commentPostOptions);
};

export {useActivityOptions, useAllActivityOptions, useActivities, useActivityPost};
