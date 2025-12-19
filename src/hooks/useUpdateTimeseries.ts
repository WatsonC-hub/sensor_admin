import {useMutation} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';

const updateTimeseriesMutationOptions = (ts_id: number) => ({
  mutationFn: async (data: any) => {
    const {data: out} = await apiClient.put(
      `/sensor_field/stamdata/update_timeseries/${ts_id}`,
      data
    );
    return out;
  },
  meta: {
    invalidates: [['metadata']],
  },
  onSuccess: () => {
    toast.success('metadata gemt');
  },
});

const useUpdateTimeseries = (ts_id: number) => {
  const updateTimeseries = useMutation(updateTimeseriesMutationOptions(ts_id));

  return {updateTimeseries};
};

export default useUpdateTimeseries;
