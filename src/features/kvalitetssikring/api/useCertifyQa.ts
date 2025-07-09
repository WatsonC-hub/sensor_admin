import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {invalidateFromMeta} from '~/helpers/InvalidationHelper';
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

interface CertifyQaPost extends CertifyQaBase {
  data: CertifyQa;
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

const onMutateCertifyQa = (ts_id: number, loc_id: number) => {
  return {
    meta: {
      invalidates: [
        queryKeys.Timeseries.certifyQa(ts_id),
        queryKeys.Location.timeseries(loc_id),
        queryKeys.Map.all(),
        queryKeys.Tasks.all(),
        queryKeys.Itineraries.all(),
        queryKeys.Timeseries.metadata(ts_id),
        queryKeys.Timeseries.QAWithTsId(ts_id),
      ],
    },
  };
};

export const useCertifyQa = () => {
  const {ts_id, loc_id} = useAppContext(['ts_id', 'loc_id']);
  const queryClient = useQueryClient();
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
    onMutate: async () => onMutateCertifyQa(ts_id, loc_id),
    onSuccess: (data, variables, context) => {
      invalidateFromMeta(queryClient, context.meta);
      toast.success('Kvalitetsstempel gemt');
    },
  });

  const put = useMutation({
    ...certifyQaPutOptions,
    onMutate: async () => onMutateCertifyQa(ts_id, loc_id),
    onSuccess: (data, variables, context) => {
      invalidateFromMeta(queryClient, context.meta);
      toast.success('Kvalitetsstempel ændret');
    },
  });

  const del = useMutation({
    ...certifyQaDelOptions,
    onMutate: async () => onMutateCertifyQa(ts_id, loc_id),
    onSuccess: (data, variables, context) => {
      invalidateFromMeta(queryClient, context.meta);
      toast.success('Kvalitetsstempel slettet');
    },
  });

  return {get, post, put, del};
};
