import {useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';
import {rerunToast} from '~/helpers/toasts';

interface ExcludeBase {
  path: string;
  data?: any;
}

interface ExcludePost extends ExcludeBase {
  data: {
    minvalue: number | null;
    maxvalue: number | null;
    startdate: string | null;
    enddate: string | null;
    comment: string;
  };
}

interface ExcludePut extends ExcludePost {
  data: {
    gid: number;
    minvalue: number | null;
    maxvalue: number | null;
    startdate: string | null;
    enddate: string | null;
    comment: string;
  };
}

export const excludePostOptions = {
  mutationKey: ['exclude_post'],
  mutationFn: async (mutation_data: ExcludePost) => {
    const {path, data} = mutation_data;
    const {data: res} = await apiClient.post(`/sensor_admin/qa_exclude/${path}`, data);
    return res;
  },
};

export const excludePutOptions = {
  mutationKey: ['exclude_put'],
  mutationFn: async (mutation_data: ExcludePut) => {
    const {path, data} = mutation_data;
    const {data: res} = await apiClient.put(`/sensor_admin/qa_exclude/${path}`, data);
    return res;
  },
};

export const excludeDelOptions = {
  mutationKey: ['exclude_del'],
  mutationFn: async (mutation_data: ExcludeBase) => {
    const {path} = mutation_data;
    const {data: res} = await apiClient.delete(`/sensor_admin/qa_exclude/${path}`);
    return res;
  },
};

export const useExclude = () => {
  const queryClient = useQueryClient();

  const post = useMutation({
    ...excludePostOptions,
    onError: (error) => {
      toast.error('Noget gik galt');
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({queryKey: ['qa_all', Number(variables.path)]});
      rerunToast();
    },
  });

  const put = useMutation({
    ...excludePutOptions,
    onError: (error) => {
      toast.error('Noget gik galt');
    },
    onSuccess: ({context}) => {
      queryClient.invalidateQueries({queryKey: ['qa_all']});
      rerunToast();
    },
  });

  const del = useMutation({
    ...excludeDelOptions,
    onError: (error) => {
      toast.error('Noget gik galt');
    },
    onSuccess: ({context}) => {
      queryClient.invalidateQueries({queryKey: ['qa_all']});
      rerunToast();
    },
  });

  return {post, put, del};
};