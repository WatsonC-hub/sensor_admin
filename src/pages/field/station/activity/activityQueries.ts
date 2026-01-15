import {
  MutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {APIError} from '~/queryClient';
import {ActivityOption, ActivityPost, ActivityRow} from './types';
import {toast} from 'react-toastify';

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

export const commentPostOptions: MutationOptions<unknown, APIError, ActivityPost> = {
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
  return useMutation({
    ...commentPostOptions,
    onSuccess: () => {
      toast.success('Aktivitet gemt');
    },
    meta: {
      invalidates: [['activities']],
    },
  });
};

const usePinActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['activity_pin'],
    mutationFn: async (id: string) => {
      const {data: res} = await apiClient.post(`/sensor_field/station/activity/pin/${id}`);
      return res;
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({queryKey: ['activities']});
      const queryCache = queryClient.getQueryCache();

      const active = queryCache.findAll({type: 'active', queryKey: ['activities']});
      // Snapshot the previous value
      if (active && active.length > 0) {
        queryClient.setQueryData<ActivityRow[]>(active[0].queryKey, (old) => {
          if (old == undefined) return [];
          return old.map((row) => {
            if (row.id == id && row.kind == 'comment') {
              return {
                ...row,
                pinned: !row.pinned,
              };
            }
            return row;
          });
        });
      }
    },
    meta: {
      invalidates: [['activities']],
      optOutGeneralInvalidations: true,
    },
  });
};

export {useActivityOptions, useAllActivityOptions, useActivities, useActivityPost, usePinActivity};
