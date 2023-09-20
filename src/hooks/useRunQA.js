import {useRef} from 'react';
import {useQueryClient, useMutation, useQuery} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';
import {toast} from 'react-toastify';

export const useRunQA = (ts_id) => {
  const queryClient = useQueryClient();
  const toastId = useRef(null);

  const {data: qaPoll, refetch} = useQuery(
    ['pollQA', ts_id],
    async () => {
      const {data, status} = await apiClient.get(`/sensor_admin/rerun_qa/poll/${ts_id}`);
      return status;
    },
    {
      enabled: true,
      refetchInterval: (status) => {
        return status === 204 ? 1000 : false;
      },
      onSuccess: (status) => {
        if (status === 200) {
          queryClient.invalidateQueries(['qa_labels', ts_id]);
          toast.update(toastId.current, {
            render: 'Genkørt',
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

  const rerunQAMutation = useMutation(
    async (data) => {
      toastId.current = toast('Genkører QA...', {
        type: toast.TYPE.INFO,
        isLoading: true,
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        progress: undefined,
        hideProgressBar: true,
      });
      const {data: res} = await apiClient.post(`/sensor_admin/rerun_qa/${ts_id}`, data);
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

  return {mutation: rerunQAMutation};
};
