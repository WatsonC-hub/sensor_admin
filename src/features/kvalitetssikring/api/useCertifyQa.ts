import {useQuery, useMutation} from '@tanstack/react-query';
import {Dayjs} from 'dayjs';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {useAppContext} from '~/state/contexts';

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

interface PostData extends Omit<CertifyQa, 'date'> {
  date: Dayjs;
}

interface CertifyQaPost extends CertifyQaBase {
  data: PostData;
}

interface CertifyQaPut extends CertifyQaBase {
  data: CertifyQa;
}

const certifyQaPostOptions = {
  mutationKey: ['certifyQa_post'],
  mutationFn: async (mutation_data: CertifyQaPost) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_admin/certify_quality/${path}`, data);
    return result;
  },
};

const certifyQaPutOptions = {
  mutationKey: ['certifyQa_put'],
  mutationFn: async (mutation_data: CertifyQaPut) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(`//${path}`, data);
    return result;
  },
};

const certifyQaDelOptions = {
  mutationKey: ['certifyQa_del'],
  mutationFn: async (mutation_data: CertifyQaBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`//${path}`);
    return result;
  },
};

export const useCertifyQa = () => {
  const {ts_id} = useAppContext(['ts_id']);
  const get = useQuery({
    queryKey: queryKeys.Timeseries.certifyQa(ts_id),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<CertifyQa>>(
        `/sensor_admin/certified_quality/${ts_id}`
      );
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: ts_id !== undefined,
  });

  const post = useMutation({
    ...certifyQaPostOptions,
    onSuccess: () => {
      toast.success('Kvalitetsstempel gemt');
    },
    meta: {
      invalidates: [['certifyQa']],
    },
  });

  const put = useMutation({
    ...certifyQaPutOptions,
    onSuccess: () => {
      toast.success('Kvalitetsstempel ændret');
    },
    meta: {
      invalidates: [['certifyQa']],
    },
  });

  const del = useMutation({
    ...certifyQaDelOptions,
    onSuccess: () => {
      toast.success('Kvalitetsstempel slettet');
    },
    meta: {
      invalidates: [['certifyQa']],
    },
  });

  return {get, post, put, del};
};
