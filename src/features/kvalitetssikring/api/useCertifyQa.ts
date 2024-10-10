import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';

export interface CertifyQa {
  id?: number;
  date: string;
  level: number;
  comment?: string;
}

interface CertifyQaBase {
  path: string;
  data?: any;
}

interface CertifyQaPost extends CertifyQaBase {
  data: CertifyQa;
}

interface CertifyQaPut extends CertifyQaBase {
  data: CertifyQa;
}

export const certifyQaPostOptions = {
  mutationKey: ['certifyQa_post'],
  mutationFn: async (mutation_data: CertifyQaPost) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_admin/certify_quality/${path}`, data);
    return result;
  },
};

export const certifyQaPutOptions = {
  mutationKey: ['certifyQa_put'],
  mutationFn: async (mutation_data: CertifyQaPut) => {
    const {path, data} = mutation_data;
    console.log('path', path, 'data', data);
    const {data: result} = await apiClient.put(`//${path}`, data);
    return result;
  },
};

export const certifyQaDelOptions = {
  mutationKey: ['certifyQa_del'],
  mutationFn: async (mutation_data: CertifyQaBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`//${path}`);
    return result;
  },
};

export const useCertifyQa = (ts_id: number | undefined) => {
  const queryClient = useQueryClient();
  const get = useQuery({
    queryKey: ['certifyQa', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<CertifyQa>>(
        `/sensor_admin/certified_quality/${ts_id}`
      );
      return data;
    },
    enabled: ts_id !== undefined,
  });

  const post = useMutation({
    ...certifyQaPostOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['certifyQa', ts_id],
      });
      toast.success('Kvalitetsstempel gemt');
    },
  });

  const put = useMutation({
    ...certifyQaPutOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['certifyQa', ts_id],
      });
      toast.success('Kvalitetsstempel ændret');
    },
  });

  const del = useMutation({
    ...certifyQaDelOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['certifyQa', ts_id],
      });
      toast.success('Kvalitetsstempel slettet');
    },
  });

  return {get, post, put, del};
};
