import {useQuery, useMutation} from '@tanstack/react-query';
import moment from 'moment';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {useAppContext} from '~/state/contexts';
import {Maalepunkt} from '~/types';

interface MaalepunktBase {
  path: string;
  data?: any;
}

interface MaalepunktPost extends MaalepunktBase {
  data: {startdate: string; enddate: string; elevation?: number; mp_description: string};
}

interface MaalepunktPut extends MaalepunktPost {
  data: {
    gid: number;
    startdate: string;
    enddate: string;
    elevation?: number;
    mp_description: string;
  };
}

export const maalepunktPostOptions = {
  mutationKey: ['maalepunkt_post'],
  mutationFn: async (mutation_data: MaalepunktPost) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_field/station/watlevmp/${path}`, data);
    return result;
  },
};

export const maalepunktPutOptions = {
  mutationKey: ['maalepunkt_put'],
  mutationFn: async (mutation_data: MaalepunktPut) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(`/sensor_field/station/watlevmp/${path}`, data);
    return result;
  },
};

export const maalepunktDelOptions = {
  mutationKey: ['maalepunkt_del'],
  mutationFn: async (mutation_data: MaalepunktBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_field/station/watlevmp/${path}`);
    return result;
  },
};

export const useMaalepunkt = () => {
  const {ts_id} = useAppContext([], ['ts_id']);

  const get = useQuery({
    queryKey: ['watlevmp', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Maalepunkt>>(
        `/sensor_field/station/watlevmp/${ts_id}`
      );

      return data.map((m) => {
        return {
          ...m,
          startdate: moment(m.startdate).format('YYYY-MM-DD HH:mm:ss'),
          enddate: moment(m.enddate).format('YYYY-MM-DD HH:mm:ss'),
        };
      });
    },
    enabled: ts_id !== null || ts_id !== undefined,
  });

  const post = useMutation({
    ...maalepunktPostOptions,
    onSuccess: () => {
      get.refetch();
      toast.success('Målepunkt gemt');
    },
  });

  const put = useMutation({
    ...maalepunktPutOptions,
    onSuccess: () => {
      get.refetch();
      toast.success('Målepunkt ændret');
    },
  });

  const del = useMutation({
    ...maalepunktDelOptions,
    onSuccess: () => {
      toast.success('Målepunkt slettet');
      get.refetch();
    },
  });

  return {get, post, put, del};
};
