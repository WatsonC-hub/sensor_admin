import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {apiClient} from 'src/apiClient';

const TOAST_ID = 'correct-toast';

export const useCorrectData = (ts_id, queryKey) => {
  const queryClient = useQueryClient();

  const {data: pollData, refetch} = useQuery(
    ['pollData', ts_id],
    async () => {
      const {data, status} = await apiClient.get(`/sensor_field/station/correct/poll/${ts_id}`);
      return status;
    },
    {
      enabled: true,
      refetchInterval: (status) => {
        return status === 204 ? 1000 : false;
      },
      onSuccess: (status) => {
        if (status === 200) {
          queryClient.invalidateQueries([queryKey, ts_id]);
          toast.update(TOAST_ID, {
            render: 'Genberegnet',
            type: toast.TYPE.SUCCESS,
            isLoading: false,
            autoClose: 2000,
            closeOnClick: true,
            draggable: true,
            progress: undefined,
            hideProgressBar: false,
          });
        }
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  const correctMutation = useMutation(
    async (data) => {
      toast('Genberegner...', {
        toastId: TOAST_ID,
        type: toast.TYPE.INFO,
        isLoading: true,
        autoClose: false,
        closeOnClick: true,
        draggable: false,
        progress: undefined,
        hideProgressBar: true,
      });
      const {data: res} = await apiClient.post(`/sensor_field/station/correct/${ts_id}`, data);
      return res;
    },
    {
      onSuccess: () => {
        setTimeout(() => {
          refetch();
        }, 5000);
        //handleXRangeChange({'xaxis.range[0]': undefined});
      },
    }
  );

  return {mutation: correctMutation};
};
