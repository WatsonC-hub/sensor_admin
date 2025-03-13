import {useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';

const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n) {
    u8arr[n - 1] = bstr.charCodeAt(n - 1);
    n -= 1; // to make eslint happy
  }
  return new File([u8arr], filename, {type: mime});
};

export const useImageUpload = (endpoint) => {
  const queryClient = useQueryClient();

  const post = useMutation({
    mutationKey: 'image_post',
    mutationFn: async (mutation_data) => {
      const {path, data} = mutation_data;
      const file = dataURLtoFile(data.uri);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('comment', data.comment);
      formData.append('public', data.public);
      formData.append('date', data.date);
      const config = {
        headers: {'Content-Type': 'multipart/form-data'},
      };

      const {data: res} = await apiClient.post(
        `/sensor_field/${endpoint}/image/${path}`,
        formData,
        config
      );
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['images'],
      });
    },
  });

  const put = useMutation({
    mutationKey: 'image_put',
    mutationFn: async (mutation_data) => {
      const {path, data} = mutation_data;
      const {data: res} = await apiClient.put(`/sensor_field/${endpoint}/image/${path}`, data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['images'],
      });
      toast.success('Ændringerne er blevet gemt');
    },
  });

  const del = useMutation({
    mutationKey: 'image_del',
    mutationFn: async (mutation_data) => {
      const {path} = mutation_data;
      const {data: res} = await apiClient.delete(`/sensor_field/${endpoint}/image/${path}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['images'],
      });
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: ['images'],
      });
    },
  });

  return {post, put, del};
};
