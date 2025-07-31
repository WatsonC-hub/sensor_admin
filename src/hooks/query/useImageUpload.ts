import {useMutation, useQueryClient} from '@tanstack/react-query';
import {Dayjs} from 'dayjs';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';

type ImageData = {
  comment: string;
  public: string;
  date: Dayjs;
  uri: string | ArrayBuffer | null;
};

type EditImageData = {
  comment: string;
  public: string;
  date: Dayjs;
  imageurl?: string; // Assuming this property exists
};

type ImagePayload = {
  path: string | number;
  data: ImageData;
};

type ImagePayloadEdit = {
  path: string;
  data: EditImageData;
};

const dataURLtoFile = (dataurl: string | ArrayBuffer | null, filename?: string) => {
  if (typeof dataurl !== 'string') {
    throw new Error('Invalid dataurl: must be a non-null string');
  }
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : '';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n) {
    u8arr[n - 1] = bstr.charCodeAt(n - 1);
    n -= 1; // to make eslint happy
  }
  return new File([u8arr], filename ?? '', {type: mime});
};

export const useImageUpload = (endpoint: string) => {
  const queryClient = useQueryClient();

  const post = useMutation({
    mutationKey: ['image_post'],
    mutationFn: async (mutation_data: ImagePayload) => {
      const {path, data} = mutation_data;
      const file = dataURLtoFile(data.uri);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('comment', data.comment);
      formData.append('public', data.public);
      formData.append('date', data.date.toISOString());
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
        queryKey: queryKeys.images(),
      });
    },
  });

  const put = useMutation({
    mutationKey: ['image_put'],
    mutationFn: async (mutation_data: ImagePayloadEdit) => {
      const {path, data} = mutation_data;
      const {data: res} = await apiClient.put(`/sensor_field/${endpoint}/image/${path}`, data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.images(),
      });
      toast.success('Ændringerne er blevet gemt');
    },
  });

  const del = useMutation({
    mutationKey: ['image_del'],
    mutationFn: async (mutation_data: ImagePayload) => {
      const {path} = mutation_data;
      const {data: res} = await apiClient.delete(`/sensor_field/${endpoint}/image/${path}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.images(),
      });
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.images(),
      });
    },
  });

  return {post, put, del};
};
