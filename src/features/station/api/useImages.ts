import {queryOptions, useQuery} from '@tanstack/react-query';
import dayjs from 'dayjs';
import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {APIError} from '~/queryClient';

export const getImageOptions = (typeId: string | number, imageType: string, type: string) =>
  queryOptions<any, APIError>({
    queryKey: queryKeys.imagesById(typeId),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/${type}/${imageType}/${typeId}`);
      return data;
    },
    select: (data) => {
      return data.map((image: any) => ({
        ...image,
        date: image.date ? dayjs(image.date) : null, // Ensure date is a Date object
      }));
    },
  });

const useImages = (typeId: string | number, imageType: string, type: string) => {
  const get = useQuery(getImageOptions(typeId, imageType, type));

  return {get};
};

export default useImages;
