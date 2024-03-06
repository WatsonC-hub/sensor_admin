import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect} from 'react';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';

const TOAST_ID = 'correct-toast';

export const useCorrectData = (ts_id, queryKey) => {
  const queryClient = useQueryClient();

  // TODO: Check me
  const {data: pollData, refetch} = useQuery({
    queryKey: ['pollData', ts_id],
    queryFn: async () => {
      const {data, status} = await apiClient.get(`/sensor_field/station/correct/poll/${ts_id}`);
      return status;
    },
    enabled: true,
    refetchInterval: (query) => {
      return query.state.data === 204 ? 100 : false;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (pollData === 200) {
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
  }, [pollData]);

  const correctMutation = useMutation({
    mutationFn: async (data) => {
      toast('Genberegner...', {
        toastId: TOAST_ID,
        type: toast.TYPE.INFO,
        isLoading: true,
        autoClose: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        hideProgressBar: true,
      });
      const {data: res} = await apiClient.post(`/sensor_field/station/correct/${ts_id}`, data);
      return res;
    },
    onSuccess: () => {
      setTimeout(() => {
        refetch();
      }, 3000);
      //handleXRangeChange({'xaxis.range[0]': undefined});
    },
  });

  return {mutation: correctMutation};
};
