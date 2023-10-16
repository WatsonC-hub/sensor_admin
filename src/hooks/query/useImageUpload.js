import {useMutation, useQueryClient} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';

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

export const imagePostOptions = {
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
      `/sensor_field/station/image/${path}`,
      formData,
      config
    );
    return res;
  },
};

export const imagePutOptions = {
  mutationKey: 'image_put',
  mutationFn: async (mutation_data) => {
    const {path, data} = mutation_data;
    const {data: res} = await apiClient.put(`/sensor_field/station/image/${path}`, data);
    return res;
  },
};

export const imageDelOptions = {
  mutationKey: 'image_del',
  mutationFn: async (mutation_data) => {
    const {path} = mutation_data;
    const {data: res} = await apiClient.delete(`/sensor_field/station/image/${path}`);
    return res;
  },
};

export const useImageUpload = () => {
  const queryClient = useQueryClient();

  const post = useMutation({
    ...imagePostOptions,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['images']);
    },
  });

  const put = useMutation({
    ...imagePutOptions,
    onSuccess: () => {
      queryClient.invalidateQueries(['images']);
    },
  });

  const del = useMutation({
    ...imageDelOptions,
    onSuccess: () => {
      queryClient.invalidateQueries(['images']);
    },
  });

  return {post, put, del};
};
