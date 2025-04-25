import {useQuery, useMutation, useQueryClient, queryOptions} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {APIError} from '~/queryClient';
import {Kontrol} from '~/types';

interface PejlingBase {
  path: string;
  data?: any;
}

interface PejlingPost extends PejlingBase {
  data: {
    comment: string | undefined;
    disttowatertable_m: number | null;
    timeofmeas: string;
    service?: boolean;
    pumpstop?: string;
    useforcorrection: number;
    extrema?: string;
  };
}

interface PejlingPut extends PejlingPost {
  data: {
    comment: string | undefined;
    disttowatertable_m: number | null;
    timeofmeas: string;
    service?: boolean;
    pumpstop?: string;
    useforcorrection: number;
    extrema?: string;
  };
}

export const pejlingPostOptions = {
  mutationKey: ['pejling_borehole_post'],
  mutationFn: async (mutation_data: PejlingPost) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(
      `/sensor_field/borehole/measurements/${path}`,
      data
    );
    return result;
  },
};

export const pejlingPutOptions = {
  mutationKey: ['pejling_borehole_put'],
  mutationFn: async (mutation_data: PejlingPut) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(`/sensor_field/borehole/measurements/${path}`, data);
    return result;
  },
};

export const pejlingDelOptions = {
  mutationKey: ['pejling_borehole_del'],
  mutationFn: async (mutation_data: PejlingBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_field/borehole/measurements/${path}`);
    return result;
  },
};

export const pejlingGetOptions = (boreholeno: string | undefined, intakeno: number | undefined) =>
  queryOptions<Array<Kontrol>, APIError>({
    queryKey: ['measurements', boreholeno],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Kontrol>>(
        `/sensor_field/borehole/measurements/${boreholeno}/${intakeno}`
      );

      return data;
    },
    enabled: boreholeno !== undefined && intakeno !== undefined,
  });

export const useBoreholePejling = (
  boreholeno: string | undefined,
  intakeno: number | undefined
) => {
  const queryClient = useQueryClient();

  const get = useQuery(pejlingGetOptions(boreholeno, intakeno));

  const post = useMutation({
    ...pejlingPostOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['measurements', boreholeno]});
      toast.success('Pejling gemt');
    },
  });

  const put = useMutation({
    ...pejlingPutOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['measurements', boreholeno]});
      toast.success('Pejling ændret');
    },
  });

  const del = useMutation({
    ...pejlingDelOptions,
    onSuccess: () => {
      toast.success('Pejling slettet');
      queryClient.invalidateQueries({queryKey: ['measurements', boreholeno]});
    },
  });

  return {get, post, put, del};
};
