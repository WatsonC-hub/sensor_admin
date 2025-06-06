import {
  useQuery,
  useMutation,
  useQueryClient,
  queryOptions,
  UseQueryOptions,
} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
// import {Notification} from '~/hooks/query/useNotificationOverview';
import {APIError} from '~/queryClient';

import type {
  completeItinerary,
  AddLocationToItinerary,
  PatchTaskitinerary,
  PostTaskitinerary,
  Task,
  Taskitinerary,
} from '../types';
import {withPermissionGuard} from '~/hooks/withPermissionGuard';

export const itineraryPostOptions = {
  mutationKey: ['itinerary_post'],
  mutationFn: async (mutation_data: PostTaskitinerary) => {
    const {data: result} = await apiClient.post(`/sensor_admin/tasks/itineraries`, mutation_data);
    return result;
  },
};

export const completeItineraryOptions = {
  mutationKey: ['itinerary_complete'],
  mutationFn: async (mutation_data: completeItinerary) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_admin/tasks/itineraries/${path}/complete`);
    return result;
  },
};

export const patchItineraryOptions = {
  mutationKey: ['itinerary_patch'],
  mutationFn: async (mutation_data: PatchTaskitinerary) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.patch(`/sensor_admin/tasks/itineraries/${path}`, data);
    return result;
  },
};

export const addLocationToItineraryOptions = {
  mutationKey: ['taskItinerary_move'],
  mutationFn: async (mutation_data: AddLocationToItinerary) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_admin/tasks/itineraries/${path}`, data);
    return result;
  },
};

const itineraryGetOptions = (itinerary_id?: string | null) =>
  queryOptions<Taskitinerary[], APIError>({
    queryKey: ['itineraries'],
    queryFn: async () => {
      const {data} = await apiClient.get('/sensor_admin/tasks/itineraries');
      return data;
    },
    enabled: itinerary_id !== null,
    staleTime: 1000 * 60 * 5,
  });

type ItineraryOptions<T> = Partial<
  Omit<UseQueryOptions<Taskitinerary[], APIError, T>, 'queryKey' | 'queryFn'>
>;

const useTaskItinerary = <T = Taskitinerary[]>(
  id?: string | null,
  options?: ItineraryOptions<T>
) => {
  const queryClient = useQueryClient();

  const get = useQuery({
    ...itineraryGetOptions(id),
    ...options,
    select: options?.select as (data: Taskitinerary[]) => T,
  });

  const getItinerary = useQuery<Taskitinerary, APIError>({
    queryKey: ['itineraries', id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_admin/tasks/itineraries/${id}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    enabled: id !== null && id !== undefined,
  });

  const getItineraryTasks = useQuery<Task[], APIError>({
    queryKey: ['itineraries_tasks', id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_admin/tasks/itineraries/${id}/tasks`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    enabled: id !== undefined,
  });

  const createItinerary = useMutation<unknown, APIError, PostTaskitinerary>({
    ...itineraryPostOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['itineraries']});
      queryClient.invalidateQueries({queryKey: ['tasks']});
      queryClient.invalidateQueries({queryKey: ['overblik']});

      toast.success('Tur oprettet');
    },
  });

  const patch = useMutation<unknown, APIError, PatchTaskitinerary>({
    ...patchItineraryOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['itineraries']});
      queryClient.invalidateQueries({queryKey: ['tasks']});
      queryClient.invalidateQueries({queryKey: ['overblik']});

      toast.success('Tur opdateret');
    },
  });

  const complete = useMutation<unknown, APIError, completeItinerary>({
    ...completeItineraryOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['itineraries']});
      queryClient.invalidateQueries({queryKey: ['tasks']});
      queryClient.invalidateQueries({queryKey: ['overblik']});

      toast.success('Tur færdiggjort');
    },
  });

  const addLocationToTrip = useMutation<unknown, APIError, AddLocationToItinerary>({
    ...addLocationToItineraryOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['overblik']});
      queryClient.invalidateQueries({queryKey: ['itineraries']});
      queryClient.invalidateQueries({queryKey: ['tasks']});
      queryClient.invalidateQueries({queryKey: ['map']});

      toast.success('Opgaver tilføjet til tur');
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

export const useGuardedTaskItinerary = withPermissionGuard(
  useTaskItinerary,
  'advancedTaskPermission'
);
