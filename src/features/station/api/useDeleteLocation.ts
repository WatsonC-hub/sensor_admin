import {useMutation} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';
import {makeAppMutationOptions} from '~/queryClient';

const deleteLocationOptions = makeAppMutationOptions({
  mutationKey: ['delete_location'],
  mutationFn: async (payload: {path: number}) => {
    const {path: loc_id} = payload;
    const res = await apiClient.delete(`/sensor_field/location/${loc_id}`);
    return res.data;
  },
  onSuccess: () => {
    toast.success('Lokation slettet');
  },
  meta: {
    invalidates: [['metadata']],
  },
});

const useDeleteLocation = () => {
  const del = useMutation(deleteLocationOptions);

  return del;
};
export default useDeleteLocation;
