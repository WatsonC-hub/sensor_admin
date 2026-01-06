import {useMutation, MutationOptions} from '@tanstack/react-query';
import {Dayjs} from 'dayjs';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';

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

export type ImagePayload = {
  path: string | number;
  data: ImageData;
};

type ImagePayloadEdit = {
  path: string;
  data: EditImageData;
};

export const dataURLtoFile = (dataurl: string | ArrayBuffer | null, filename?: string) => {
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

export const postImageMutationOptions = (
  endpoint: string,
  id?: string | number
): MutationOptions<{endpoint: string; id: string | number}, unknown, ImagePayload> => ({
  mutationKey: ['image_post', endpoint, id],
  mutationFn: async (mutation_data: ImagePayload) => {
    const {path, data} = mutation_data;
    const file = dataURLtoFile(data.uri);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('comment', data.comment);
    formData.append('public', data.public);
    formData.append('date', JSON.parse(JSON.stringify(data.date)));
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
  retryDelay: (attemptIndex: number) => Math.min(10000 * 2 ** attemptIndex, 30000),
});

export const putImageMutationOptions = (endpoint: string, id?: string | number) => ({
  mutationKey: ['image_put', endpoint, id],
  mutationFn: async (mutation_data: ImagePayloadEdit) => {
    const {path, data} = mutation_data;
    const {data: res} = await apiClient.put(`/sensor_field/${endpoint}/image/${path}`, data);
    return res;
  },
  onSuccess: () => {
    toast.success('Ændringerne er blevet gemt');
  },
});

export const deleteImageMutationOptions = (endpoint: string, id?: string | number) => ({
  mutationKey: ['image_del', endpoint, id],
  mutationFn: async (mutation_data: ImagePayload) => {
    const {path} = mutation_data;
    const {data: res} = await apiClient.delete(`/sensor_field/${endpoint}/image/${path}`);
    return res;
  },
});

export const useImageUpload = (endpoint: string, id: string | number) => {
  const post = useMutation({
    ...postImageMutationOptions(endpoint, id),
    meta: {
      invalidates: [['images']],
    },
  });

  const put = useMutation({
    ...putImageMutationOptions(endpoint, id),
    meta: {
      invalidates: [['images']],
    },
  });

  const del = useMutation({
    ...deleteImageMutationOptions(endpoint, id),
    meta: {
      invalidates: [['images']],
    },
  });

  return {post, put, del};
};
