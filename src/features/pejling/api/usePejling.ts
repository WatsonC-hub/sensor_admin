import {useQuery, useMutation, useQueryClient, queryOptions} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {APIError} from '~/queryClient';
import {useAppContext} from '~/state/contexts';
import {PejlingItem} from '~/types';

interface PejlingBase {
  path: string;
  data?: any;
}

interface PejlingPost extends PejlingBase {
  data: {
    comment?: string;
    measurement: number | null;
    timeofmeas: string;
    useforcorrection: number;
    extrema?: string | null;
    pumpstop?: string | null;
    service?: boolean;
  };
}

interface PejlingPut extends PejlingPost {
  data: {
    comment?: string;
    measurement: number | null;
    timeofmeas: string;
    useforcorrection: number;
    extrema?: string | null;
    pumpstop?: string | null;
    service?: boolean;
  };
}

export const pejlingPostOptions = {
  mutationKey: ['pejling_post'],
  mutationFn: async (mutation_data: PejlingPost) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_field/station/measurements/${path}`, data);
    return result;
  },
};

export const pejlingPutOptions = {
  mutationKey: ['pejling_put'],
  mutationFn: async (mutation_data: PejlingPut) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(`/sensor_field/station/measurements/${path}`, data);
    return result;
  },
};

export const pejlingDelOptions = {
  mutationKey: ['pejling_del'],
  mutationFn: async (mutation_data: PejlingBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_field/station/measurements/${path}`);
    return result;
  },
};

export const pejlingGetOptions = (ts_id: number | undefined) =>
  queryOptions<Array<PejlingItem>, APIError>({
    queryKey: ['measurements', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<PejlingItem>>(
        `/sensor_field/station/measurements/${ts_id}`
      );

      return data;
    },
    enabled: ts_id !== null && ts_id !== undefined,
  });

export const usePejling = () => {
  const queryClient = useQueryClient();
  const {ts_id} = useAppContext(['ts_id']);

  const get = useQuery(pejlingGetOptions(ts_id));

  const post = useMutation({
    ...pejlingPostOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['measurements', ts_id]});
      toast.success('Pejling gemt');
    },
  });

  const put = useMutation({
    ...pejlingPutOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['measurements', ts_id]});
      toast.success('Pejling ændret');
    },
  });

  const del = useMutation({
    ...pejlingDelOptions,
    onSuccess: () => {
      toast.success('Pejling slettet');
      queryClient.invalidateQueries({queryKey: ['measurements', ts_id]});
    },
  });

  return {get, post, put, del};
};
