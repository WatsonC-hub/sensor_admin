import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect, useState} from 'react';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';

const TOAST_ID = 'correct-toast';

export const useCorrectData = (ts_id: number, queryKey: string) => {
  const queryClient = useQueryClient();
  const [refetchInterval, setRefetchInterval] = useState<number | false>(false);
  // TODO: Check me
  const {data: pollData, dataUpdatedAt} = useQuery({
    queryKey: ['pollData', ts_id],
    queryFn: async () => {
      const {status} = await apiClient.get(`/sensor_field/station/correct/poll/${ts_id}`);
      return status;
    },
    refetchInterval: refetchInterval,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (pollData === 200) {
      setRefetchInterval(false);
      queryClient.invalidateQueries({queryKey: [queryKey, ts_id]});
      toast.update(TOAST_ID, {
        render: 'Genberegnet',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        hideProgressBar: false,
      });
    }
  }, [pollData, queryKey, queryClient, ts_id, dataUpdatedAt]);

  const correctMutation = useMutation({
    mutationFn: async () => {
      toast('Genberegner...', {
        toastId: TOAST_ID,
        type: 'info',
        isLoading: true,
        autoClose: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        hideProgressBar: true,
      });
      const {data: res} = await apiClient.post(`/sensor_field/station/correct/${ts_id}`);
      return res;
    },
    onSuccess: () => {
      // refetch();
      setRefetchInterval(1000);
      //handleXRangeChange({'xaxis.range[0]': undefined});
    },
    onError: () => {
      setRefetchInterval(false);
    },
  });

  return {mutation: correctMutation};
};
