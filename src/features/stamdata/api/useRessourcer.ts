import {useQuery, useMutation, queryOptions} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {Ressourcer} from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/types';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {APIError} from '~/queryClient';
import {useAppContext} from '~/state/contexts';

interface RessourcerBase {
  path: string;
  data?: any;
}

interface RessourcerPost extends RessourcerBase {
  data: {
    ressourcer: Array<Ressourcer>;
  };
}

const ressourcerPostOptions = {
  mutationKey: ['ressourcer_post'],
  mutationFn: async (mutation_data: RessourcerPost) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_field/stamdata/ressourcer/${path}`, data);
    return result;
  },
};

export const getRessourcerOptions = (loc_id: number) =>
  queryOptions<Array<Ressourcer>, APIError>({
    queryKey: queryKeys.Location.locationRessources(loc_id),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/stamdata/ressourcer/${loc_id}`);

      return data;
    },
  });

export const useRessourcer = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const get = useQuery({
    queryKey: queryKeys.Location.ressources(),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Ressourcer>>(`/sensor_field/stamdata/ressourcer`);

      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: loc_id !== undefined,
  });

  const relation = useQuery(getRessourcerOptions(loc_id));

  const post = useMutation({
    ...ressourcerPostOptions,
    onSuccess: () => {
      toast.success('Huskeliste gemt');
    },
    meta: {
      invalidates: [
        queryKeys.Location.locationRessources(loc_id),
        queryKeys.Location.info(loc_id),
        ['collection'],
        queryKeys.StationProgress(),
      ],
      optOutGeneralInvalidations: true,
    },
  });

  return {get, relation, post};
};
