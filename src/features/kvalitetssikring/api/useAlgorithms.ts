import {useQuery, useMutation, useQueryClient, queryOptions} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {APIError} from '~/queryClient';
import {useAppContext} from '~/state/contexts';
import {QaAlgorithms} from '~/types';
interface AlgorithmsBase {
  path: string;
  data?: any;
}

interface AlgorithmsPut extends AlgorithmsBase {
  data: {
    algorithm: string;
    parameters: Record<string, any>;
    disabled: boolean;
  };
}

interface AlgorithmsRevert extends AlgorithmsBase {
  data: {
    algorithm: string;
  };
}

const algorithmsPutOptions = {
  mutationKey: ['algorithms_put'],
  mutationFn: async (mutation_data: AlgorithmsPut) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(`/sensor_admin/algorithms/${path}`, data);
    return result;
  },
};
const algorithmsDelOptions = {
  mutationKey: ['algorithms_del'],
  mutationFn: async (mutation_data: AlgorithmsBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_admin/algorithms/${path}`);
    return result;
  },
};

const algorithmsRevertOptions = {
  mutationKey: ['algorithms_revert'],
  mutationFn: async (mutation_data: AlgorithmsRevert) => {
    const {path} = mutation_data;
    const {data: response} = await apiClient.delete(`/sensor_admin/algorithms/${path}`);
    return response;
  },
};

export const getAlgorithmOptions = (ts_id: number) =>
  queryOptions<Array<QaAlgorithms>, APIError>({
    queryKey: queryKeys.Timeseries.algorithms(ts_id),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_admin/algorithms/${ts_id}`);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: ts_id !== undefined,
  });

export const useAlgorithms = () => {
  const {ts_id} = useAppContext(['ts_id']);
  const queryClient = useQueryClient();
  const get = useQuery(getAlgorithmOptions(ts_id));

  const handlePrefetch = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.Timeseries.algorithms(ts_id),
      queryFn: async () => {
        const {data} = await apiClient.get<Array<QaAlgorithms>>(
          `/sensor_admin/algorithms/${ts_id}`
        );
        return data;
      },
    });
  };

  const put = useMutation({
    ...algorithmsPutOptions,
    onSuccess: () => {
      toast.success('Ændringer gemt');
    },
    meta: {
      invalidates: [['register']],
    },
  });
  const del = useMutation({
    ...algorithmsDelOptions,
    onSuccess: () => {
      toast.success('Algorithms slettet');
    },
    meta: {
      invalidates: [['register']],
    },
  });

  const revert = useMutation({
    ...algorithmsRevertOptions,
    onSuccess: () => {
      toast.success('Algoritme nulstillet');
    },
    meta: {
      invalidates: [['register']],
    },
  });

  return {get, handlePrefetch, put, del, revert};
};
