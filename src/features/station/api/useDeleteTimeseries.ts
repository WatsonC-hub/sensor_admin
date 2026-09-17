import {useMutation} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {makeAppMutationOptions} from '~/queryClient';

type DeleteMutationPayload = {
  path: string;
};

const deleteTimeseriesMutationOptions = makeAppMutationOptions({
  mutationKey: ['delete_timeseries'],
  mutationFn: async (payload: DeleteMutationPayload) => {
    const {path: ts_id} = payload;
    const res = await apiClient.delete(`/sensor_field/timeseries/${ts_id}`);
    return res.data;
  },
  meta: {
    invalidates: [['metadata']],
  },
});

const useDeleteTimeseries = () => {
  const del = useMutation(deleteTimeseriesMutationOptions);

  return del;
};

export default useDeleteTimeseries;
