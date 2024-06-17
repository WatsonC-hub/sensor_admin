import {useMutation, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import {z} from 'zod';

import {apiClient} from '~/apiClient';
import {TilsynItem} from '~/types';

import {getTilsynQueryOptions} from './getTilsyn';

export const createOrUpdateTilsynInputSchema = z.object({
  batteriskift: z.boolean().optional(),
  dato: z.string().transform((value) => moment(value).format('YYYY-MM-DDTHH:mm')),
  gid: z.number(),
  kommentar: z.string().optional(),
  tilsyn: z.boolean().optional(),
  user_id: z.string().optional(),
});

export type CreateTilsynInput = z.infer<typeof createOrUpdateTilsynInputSchema>;

export const createOrUpdateTilsyn = ({
  ts_id,
  data,
}: {
  ts_id: number;
  data: CreateTilsynInput;
}): Promise<TilsynItem> => {
  console.log('ts_id', ts_id, 'data', data);
  if (data.gid === -1) return apiClient.post(`/sensor_field/station/service/${ts_id}`, data);
  else return apiClient.put(`/sensor_field/station/service/${ts_id}/${data.gid}`, data);
};

type UseCreateOrUpdateTilsynOptions = {
  ts_id: number;
  mutationConfig?: any;
};

export const useCreateOrUpdateTilsyn = ({
  ts_id,
  mutationConfig,
}: UseCreateOrUpdateTilsynOptions) => {
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
    mutationFn: createOrUpdateTilsyn,
  });
};
