import {useMutation, useQueryClient} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';

import {getTilsynQueryOptions} from './getTilsyn';

export const deleteTilsyn = ({ts_id, gid}: {ts_id: number; gid: string}) => {
  return apiClient.delete(`/sensor_field/station/service/${ts_id}/${gid}`);
};

type UseDeleteTilsynOptions = {
  mutationConfig?: any;
};

export const useDeleteTilsyn = (ts_id: number, {mutationConfig}: UseDeleteTilsynOptions = {}) => {
  const queryClient = useQueryClient();

  const {onSuccess, ...restConfig} = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getTilsynQueryOptions(ts_id).queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteTilsyn,
  });
};
