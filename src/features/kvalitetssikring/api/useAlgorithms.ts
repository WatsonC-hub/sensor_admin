import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {QaAlgorithms} from '~/types';
interface AlgorithmsBase {
  path: string;
  data?: any;
}
// interface AlgorithmsPost extends AlgorithmsBase {
//   data: {
//     algorithm: string;
//     parameters: Record<string, any>;
//   };
// }
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

// export const algorithmsPostOptions = {
//   mutationKey: ['algorithms_post'],
//   mutationFn: async (mutation_data: AlgorithmsPost) => {
//     const {data} = mutation_data;
//     const {data: result} = await apiClient.post(`/sensor_admin/algorithms`, data);
//     return result;
//   },
// };
export const algorithmsPutOptions = {
  mutationKey: ['algorithms_put'],
  mutationFn: async (mutation_data: AlgorithmsPut) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(`/sensor_admin/algorithms/${path}`, data);
    return result;
  },
};
export const algorithmsDelOptions = {
  mutationKey: ['algorithms_del'],
  mutationFn: async (mutation_data: AlgorithmsBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_admin/algorithms/${path}`);
    return result;
  },
};

export const algorithmsRevertOptions = {
  mutationKey: ['algorithms_revert'],
  mutationFn: async (mutation_data: AlgorithmsRevert) => {
    const {path} = mutation_data;
    const {data: response} = await apiClient.delete(`/sensor_admin/algorithms/${path}`);
    return response;
  },
};

export const useAlgorithms = (ts_id: string | undefined) => {
  const queryClient = useQueryClient();
  const get = useQuery({
    queryKey: ['algorithms', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<QaAlgorithms>>(`/sensor_admin/algorithms/${ts_id}`);
      return data;
    },
    enabled: ts_id !== undefined,
  });

  const handlePrefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ['algorithms', ts_id],
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
      queryClient.invalidateQueries({
        queryKey: ['algorithms', ts_id],
      });
      toast.success('Algorithms ændret');
    },
  });
  const del = useMutation({
    ...algorithmsDelOptions,
    onSuccess: () => {
      toast.success('Algorithms slettet');
      queryClient.invalidateQueries({
        queryKey: ['algorithms', ts_id],
      });
    },
  });

  const revert = useMutation({
    ...algorithmsRevertOptions,
    onSuccess: () => {
      toast.success('Algoritme nulstillet');
      queryClient.invalidateQueries({
        queryKey: ['algorithms', ts_id],
      });
    },
  });

  return {get, handlePrefetch, put, del, revert};
};
