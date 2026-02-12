import {useQuery, useMutation, queryOptions} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
// import {Notification} from '~/hooks/query/useNotificationOverview';

import {
  type completeItinerary,
  type AddLocationToItinerary,
  type PatchTaskitinerary,
  type PostTaskitinerary,
  type Taskitinerary,
  TaskPermission,
  MergeItinerary,
} from '../types';
import {useUser} from '~/features/auth/useUser';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {QueryType} from '~/types';

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

const addLocationToItineraryOptions = {
  mutationKey: ['taskItinerary_move'],
  mutationFn: async (mutation_data: AddLocationToItinerary) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_admin/tasks/itineraries/${path}`, data);
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

const mergeTripsOptions = {
  mutationKey: ['taskItinerary_merge'],
  mutationFn: async (mutation_data: MergeItinerary) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(
      `/sensor_admin/tasks/itineraries/${path}/merge`,
      data
    );
    return result;
  },
};

const getItinerariesOptions = <T = Taskitinerary[]>(select?: (data: Taskitinerary[]) => T) =>
  queryOptions({
    queryKey: queryKeys.Itineraries.all(),
    queryFn: async () => {
      const {data} = await apiClient.get<Taskitinerary[]>('/sensor_admin/tasks/itineraries');
      return data;
    },
    staleTime: 1000 * 60 * 10,
    select,
  });

const useItineraries = <T = Taskitinerary[]>(
  options?: QueryType<typeof getItinerariesOptions<T>>
) => {
  const {
    features: {tasks},
  } = useUser();
  const permissionRequired = tasks === TaskPermission.advanced;

  return useQuery({
    ...getItinerariesOptions(options?.select),
    ...options,
    enabled: permissionRequired,
  });
};

const getItineraryOptions = (id: string | null) =>
  queryOptions({
    queryKey: queryKeys.Itineraries.byId(id ?? null),
    queryFn: async () => {
      const {data} = await apiClient.get<Taskitinerary>(`/sensor_admin/tasks/itineraries/${id}`);
      return data;
    },
    enabled: id !== null,
    staleTime: 1000 * 60 * 10,
  });

const useItinerary = (id: string | null) => {
  const {
    features: {tasks},
  } = useUser();
  const permissionRequired = tasks === TaskPermission.advanced;
  const options = getItineraryOptions(id);
  return useQuery({
    ...options,
    enabled: permissionRequired && options.enabled,
  });
};

const getItineraryTasksOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.Itineraries.itineraryTasks(id),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_admin/tasks/itineraries/${id}/tasks`);
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

const useItineraryTasks = (id: string) => {
  const {
    features: {tasks},
  } = useUser();
  const permissionRequired = tasks === TaskPermission.advanced;

  return useQuery({
    ...getItineraryTasksOptions(id),
    enabled: permissionRequired,
  });
};

const useItineraryMutations = () => {
  const createItinerary = useMutation({
    ...itineraryPostOptions,
    onSuccess: () => {
      toast.success('Tur oprettet');
    },
    meta: {
      invalidates: [queryKeys.Itineraries.all()],
      optOutGeneralInvalidations: true,
    },
  });

  const patch = useMutation({
    ...patchItineraryOptions,
    onSuccess: () => {
      toast.success('Tur opdateret');
    },
    meta: {
      invalidates: [queryKeys.Itineraries.all()],
    },
  });

  const complete = useMutation({
    ...completeItineraryOptions,
    onSuccess: () => {
      toast.success('Tur færdiggjort');
    },
    meta: {
      invalidates: [queryKeys.Itineraries.all()],
    },
  });

  const mergeTrips = useMutation({
    ...mergeTripsOptions,
    onSuccess: () => {
      toast.success('Lokationer flyttet til tur');
    },
    meta: {
      invalidates: [queryKeys.Itineraries.all()],
    },
  });

  const addLocationToTrip = useMutation({
    ...addLocationToItineraryOptions,
    onSuccess: () => {
      toast.success('Opgaver tilføjet til tur');
    },
    meta: {
      invalidates: [queryKeys.Itineraries.all()],
    },
  });

  return {
    createItinerary,
    patch,
    complete,
    addLocationToTrip,
    mergeTrips,
  };
};

export {useItineraries, useItinerary, useItineraryTasks, useItineraryMutations};
