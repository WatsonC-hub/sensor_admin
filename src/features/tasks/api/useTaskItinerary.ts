import {useQuery, useMutation, UseQueryOptions} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
// import {Notification} from '~/hooks/query/useNotificationOverview';
import {APIError} from '~/queryClient';

import {
  type completeItinerary,
  type AddLocationToItinerary,
  type PatchTaskitinerary,
  type PostTaskitinerary,
  type Task,
  type Taskitinerary,
  TaskPermission,
} from '../types';
import {useUser} from '~/features/auth/useUser';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';

const itineraryPostOptions = {
  mutationKey: ['itinerary_post'],
  mutationFn: async (mutation_data: PostTaskitinerary) => {
    const {data: result} = await apiClient.post(`/sensor_admin/tasks/itineraries`, mutation_data);
    return result;
  },
};

const completeItineraryOptions = {
  mutationKey: ['itinerary_complete'],
  mutationFn: async (mutation_data: completeItinerary) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_admin/tasks/itineraries/${path}/complete`);
    return result;
  },
};

const patchItineraryOptions = {
  mutationKey: ['itinerary_patch'],
  mutationFn: async (mutation_data: PatchTaskitinerary) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.patch(`/sensor_admin/tasks/itineraries/${path}`, data);
    return result;
  },
};

const addLocationToItineraryOptions = {
  mutationKey: ['taskItinerary_move'],
  mutationFn: async (mutation_data: AddLocationToItinerary) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_admin/tasks/itineraries/${path}`, data);
    return result;
  },
};

type ItineraryOptions<T> = Partial<
  Omit<UseQueryOptions<Taskitinerary[], APIError, T>, 'queryKey' | 'queryFn'>
>;

const useTaskItinerary = <T = Taskitinerary[]>(
  id?: string | null,
  options?: ItineraryOptions<T>
) => {
  const user = useUser();

  const idRequired = id !== null && id !== undefined;
  const permissionRequired = user?.features?.tasks === TaskPermission.advanced;
  const enabled = idRequired && permissionRequired;

  const get = useQuery({
    queryKey: queryKeys.Itineraries.all(),
    queryFn: async () => {
      const {data} = await apiClient.get('/sensor_admin/tasks/itineraries');
      return data;
    },
    staleTime: 1000 * 60 * 10,
    enabled: permissionRequired,
    ...options,
    select: options?.select as (data: Taskitinerary[]) => T,
  });

  const getItinerary = useQuery<Taskitinerary, APIError>({
    queryKey: queryKeys.Itineraries.byId(id ?? null),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_admin/tasks/itineraries/${id}`);
      return data;
    },
    staleTime: 1000 * 60 * 2,
    enabled: enabled,
  });

  const getItineraryTasks = useQuery<Task[], APIError>({
    queryKey: queryKeys.Itineraries.itineraryTasks(id ?? undefined),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_admin/tasks/itineraries/${id}/tasks`);
      return data;
    },
    staleTime: 1000 * 60 * 2,
    enabled: enabled,
  });

  const createItinerary = useMutation({
    ...itineraryPostOptions,
    onSuccess: () => {
      toast.success('Tur oprettet');
    },
    meta: {
      invalidates: [['itineraries']],
    },
  });

  const patch = useMutation({
    ...patchItineraryOptions,
    onSuccess: () => {
      toast.success('Tur opdateret');
    },
    meta: {
      invalidates: [['itineraries']],
    },
  });

  const complete = useMutation({
    ...completeItineraryOptions,
    onSuccess: () => {
      toast.success('Tur færdiggjort');
    },
    meta: {
      invalidates: [['itineraries']],
    },
  });

  const addLocationToTrip = useMutation({
    ...addLocationToItineraryOptions,
    onSuccess: () => {
      toast.success('Opgaver tilføjet til tur');
    },
    meta: {
      invalidates: [['itineraries']],
    },
  });

  return {
    get,
    getItinerary,
    createItinerary,
    patch,
    getItineraryTasks,
    complete,
    addLocationToTrip,
  };
};

export default useTaskItinerary;
