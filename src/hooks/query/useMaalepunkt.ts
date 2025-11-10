import {useQuery, useMutation, queryOptions} from '@tanstack/react-query';
import {Dayjs} from 'dayjs';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {APIError} from '~/queryClient';
import {Maalepunkt} from '~/types';

interface MaalepunktBase {
  path: string;
  data?: any;
}

interface MaalepunktPost extends MaalepunktBase {
  data: {
    startdate: Dayjs;
    enddate: Dayjs;
    elevation: number | null;
    mp_description?: string;
  };
}

interface MaalepunktPut extends MaalepunktPost {
  data: {
    gid?: number;
    startdate: Dayjs;
    enddate: Dayjs;
    elevation: number | null;
    mp_description?: string;
  };
}

const maalepunktPostOptions = {
  mutationKey: ['maalepunkt_post'],
  mutationFn: async (mutation_data: MaalepunktPost) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_field/station/watlevmp/${path}`, data);
    return result;
  },
};

const maalepunktPutOptions = {
  mutationKey: ['maalepunkt_put'],
  mutationFn: async (mutation_data: MaalepunktPut) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(`/sensor_field/station/watlevmp/${path}`, data);
    return result;
  },
};

const maalepunktDelOptions = {
  mutationKey: ['maalepunkt_del'],
  mutationFn: async (mutation_data: MaalepunktBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_field/station/watlevmp/${path}`);
    return result;
  },
};

export const getMaalepunktOptions = (ts_id: number | undefined) =>
  queryOptions<Array<Maalepunkt>, APIError>({
    queryKey: queryKeys.Timeseries.maalepunkt(ts_id),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Maalepunkt>>(
        `/sensor_field/station/watlevmp/${ts_id}`
      );

      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: ts_id !== null || ts_id !== undefined,
  });

export const useMaalepunkt = (ts_id: number | undefined) => {
  const get = useQuery(getMaalepunktOptions(ts_id));

  const post = useMutation({
    ...maalepunktPostOptions,
    onSuccess: () => {
      get.refetch();
      toast.success('Målepunkt gemt');
    },
    meta: {
      invalidates: [['register']],
    },
  });

  const put = useMutation({
    ...maalepunktPutOptions,
    onSuccess: () => {
      get.refetch();
      toast.success('Målepunkt ændret');
    },
    meta: {
      invalidates: [['register']],
    },
  });

  const del = useMutation({
    ...maalepunktDelOptions,
    onSuccess: () => {
      get.refetch();
      toast.success('Målepunkt slettet');
    },
    meta: {
      invalidates: [['register']],
    },
  });

  return {get, post, put, del};
};
