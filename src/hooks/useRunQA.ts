import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useState, useEffect} from 'react';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';

const TOAST_ID = 'qa-toast';

export const useRunQA = (ts_id: number) => {
  const queryClient = useQueryClient();
  const [refetchInterval, setRefetchInterval] = useState<number | false>(false);
  // TODO: Check me
  const {data: pollData, dataUpdatedAt} = useQuery({
    queryKey: ['pollQA', ts_id],
    queryFn: async () => {
      const {status} = await apiClient.get(`/sensor_admin/rerun_qa/poll/${ts_id}`);
      return status;
    },
    enabled: true,
    refetchInterval: refetchInterval,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (pollData === 200) {
      setRefetchInterval(false);
      queryClient.invalidateQueries({queryKey: ['qa_labels', ts_id]});
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
  }, [pollData, queryClient, ts_id, dataUpdatedAt]);

  const rerunQAMutation = useMutation({
    mutationFn: async (data) => {
      toast('Genberegner QA...', {
        toastId: TOAST_ID,
        type: 'info',
        isLoading: true,
        autoClose: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        hideProgressBar: true,
      });
      const {data: res} = await apiClient.post(`/sensor_admin/rerun_qa/${ts_id}`, data);
      return res;
    },
    onSuccess: () => {
      setRefetchInterval(1000);
      //handleXRangeChange({'xaxis.range[0]': undefined});
    },
    onError: () => {
      setRefetchInterval(false);
    },
  });

  return {mutation: rerunQAMutation};
};
