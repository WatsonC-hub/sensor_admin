import {queryOptions, useMutation, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';

export type ProgressStatus = {
  images: boolean;
  adgangsforhold: boolean;
  ressourcer: boolean;
  kontakter: boolean;
  watlevmp: boolean;
  sync: boolean;
  kontrolhyppighed: boolean;
  alarm: boolean;
  samplesend: boolean;
  sla: boolean;
  visibility: boolean;
};

const getQueryOptions = <TData = ProgressStatus>(
  loc_id: number | undefined,
  ts_id?: number,
  select?: (data: ProgressStatus) => TData
) =>
  queryOptions({
    queryKey: queryKeys.metadataProgress(loc_id, ts_id),
    queryFn: async () => {
      const tsParam = ts_id ?? -1;
      const {data} = await apiClient.get<ProgressStatus>(
        `/sensor_field/stamdata/progress/${loc_id}/${tsParam}`
      );
      return data;
    },
    select,
    enabled: loc_id != undefined || ts_id != undefined,
  });

const useProgress = <TData = ProgressStatus>(
  loc_id: number | undefined,
  ts_id?: number,
  options?: Omit<ReturnType<typeof getQueryOptions<TData>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    ...getQueryOptions(loc_id, ts_id, options?.select),
    ...options,
  });
};

const useStationProgress = (
  loc_id: number | undefined,
  progressKey: keyof ProgressStatus,
  ts_id?: number
) => {
  const {data: progress} = useProgress(loc_id, ts_id, {
    select: (data) => data[progressKey],
  });

  const mutation = useUpdateProgress(loc_id, ts_id);
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

const useUpdateProgress = (loc_id: number | undefined, ts_id?: number) => {
  const mutation = useMutation({
    mutationFn: async (data: Partial<ProgressStatus>) => {
      const {data: res} = await apiClient.put(
        `/sensor_field/stamdata/progress/${loc_id}/${ts_id}`,
        data
      );
      return res;
    },
    meta: {
      invalidates: [queryKeys.Timeseries.StationProgress(loc_id, ts_id)],
      optOutGeneralInvalidations: true,
    },
  });

  return mutation;
};

export {useProgress, useStationProgress};
