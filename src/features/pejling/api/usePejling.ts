import {useQuery, useMutation} from '@tanstack/react-query';
import moment from 'moment';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {stamdataStore} from '~/state/store';
import {PejlingItem} from '~/types';

interface PejlingBase {
  path: string;
  data?: any;
}

interface PejlingPost extends PejlingBase {
  data: {
    comment: string;
    gid: number;
    measurement: number;
    timeofmeas: string;
    useforcorrection: number;
  };
}

interface PejlingPut extends PejlingPost {
  data: {
    comment: string;
    gid: number;
    measurement: number;
    timeofmeas: string;
    useforcorrection: number;
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

export const usePejling = () => {
  const ts_id = stamdataStore((store) => store.timeseries.ts_id);
  const get = useQuery({
    queryKey: ['measurements', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<PejlingItem>>(
        `/sensor_field/station/measurements/${ts_id}`
      );

      return data.map((m) => {
        return {
          ...m,
          timeofmeas: moment(m.timeofmeas).format('YYYY-MM-DD HH:mm:ss'),
        };
      });
    },
    enabled: ts_id !== -1 && ts_id !== null,
  });

  const post = useMutation({
    ...pejlingPostOptions,
    onSuccess: () => {
      get.refetch();
      toast.success('Pejling gemt');
    },
  });

  const put = useMutation({
    ...pejlingPutOptions,
    onSuccess: () => {
      get.refetch();
      toast.success('Pejling ændret');
    },
  });

  const del = useMutation({
    ...pejlingDelOptions,
    onSuccess: () => {
      toast.success('Pejling slettet');
      get.refetch();
    },
  });

  return {get, post, put, del};
};
