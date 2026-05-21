import {queryOptions, useQuery} from '@tanstack/react-query';
import dayjs from 'dayjs';
import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {Image} from '~/types';

export const getImageOptions = (typeId: string | number, type: 'station' | 'borehole') =>
  queryOptions({
    queryKey: queryKeys.imagesById(typeId),
    queryFn: async () => {
      const endpointName = type === 'borehole' ? 'image' : 'images';
      const {data} = await apiClient.get<Image[]>(
        `/sensor_field/${type}/${endpointName}/${typeId}`
      );
      return data.map((image) => ({
        ...image,
        date: dayjs(image.date), // Ensure date is a Date object
      }));
    },
    enabled: !!typeId,
  });

const useImages = (typeId: string | number, type: 'station' | 'borehole') => {
  const get = useQuery(getImageOptions(typeId, type));

  return {get};
};

export default useImages;
