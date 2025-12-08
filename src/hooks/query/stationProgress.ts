import {queryOptions, useMutation, useQuery, UseQueryOptions} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';

export type ProgressStatus = {
  images: boolean;
  adgangsforhold: boolean;
  ressourcer: boolean;
};

export const getQueryOptions = (ts_id: number | undefined) =>
  queryOptions<ProgressStatus>({
    queryKey: queryKeys.metadataProgress(ts_id),
    queryFn: async () => {
      const {data} = await apiClient.get<ProgressStatus>(
        `/sensor_field/stamdata/progress/${ts_id}`
      );
      return data;
    },
    enabled: ts_id != undefined,
  });

type ProgressStatusOptions<T> = Partial<
  Omit<UseQueryOptions<ProgressStatus, Error, T>, 'queryKey' | 'queryFn'>
>;

const useProgress = <T = ProgressStatus>(
  ts_id: number | undefined,
  options?: ProgressStatusOptions<T>
) => {
  const query = useQuery({
    ...getQueryOptions(ts_id),
    ...options,
    select: options?.select as (data: ProgressStatus) => T,
  });

  return query;
};

const useUpdateProgress = (ts_id: number | undefined) => {
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const {data: res} = await apiClient.put(`/sensor_field/stamdata/progress/${ts_id}`, data);
      return res;
    },
    meta: {
      invalidates: [['register']],
    },
  });

  return mutation;
};

const useStationProgress = (ts_id: number | undefined, progressKey: keyof ProgressStatus) => {
  const {data: progress} = useProgress(ts_id, {
    select: (data) => data[progressKey],
  });

  const mutation = useUpdateProgress(ts_id);

  const hasAssessed = async () => {
    mutation.mutate({
      [progressKey]: true,
    });
  };

  return {
    needsProgress: progress == false ? true : false,
    hasAssessed,
  };
};

export {useProgress, useUpdateProgress, useStationProgress};
