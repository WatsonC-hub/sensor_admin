import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
// import {Notification} from '~/hooks/query/useNotificationOverview';
import {useUser} from '~/features/auth/useUser';
import {queryKeys} from '~/helpers/queryKeyFactoryHelper';

import type {
  AddLocationToItinerary,
  CompleteItineraryResult,
  ItineraryHistoryFilters,
  MergeItinerary,
  PatchTaskitinerary,
  PostTaskitinerary,
  Taskitinerary,
  Tilknytning,
  TurForloebEvent,
  completeItinerary,
} from '../types';
import type {QueryType} from '~/types';

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
    const {data: result} = await apiClient.post<CompleteItineraryResult>(
      `/sensor_admin/tasks/itineraries/${path}/complete`
    );
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
  const {advancedTaskPermission} = useUser();

  return useQuery({
    ...getItinerariesOptions(options?.select),
    ...options,
    enabled: advancedTaskPermission,
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
  const {advancedTaskPermission} = useUser();
  const options = getItineraryOptions(id);
  return useQuery({
    ...options,
    enabled: advancedTaskPermission && options.enabled,
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
  const {advancedTaskPermission} = useUser();

  return useQuery({
    ...getItineraryTasksOptions(id),
    enabled: advancedTaskPermission,
  });
};

/** Afsluttede ture per page of the Turhistorik. */
const HISTORY_PAGE_SIZE = 50;

const getItineraryHistoryOptions = (filters: ItineraryHistoryFilters) =>
  infiniteQueryOptions({
    queryKey: queryKeys.Itineraries.history(filters),
    queryFn: async ({pageParam}) => {
      const {data} = await apiClient.get<Taskitinerary[]>(
        '/sensor_admin/tasks/itineraries/history',
        {
          params: {
            assigned_to: filters.assigned_to ?? undefined,
            search: filters.search.trim() || undefined,
            limit: HISTORY_PAGE_SIZE,
            offset: pageParam,
          },
        }
      );
      return data;
    },
    initialPageParam: 0,
    // A short page is the last one.
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < HISTORY_PAGE_SIZE ? undefined : allPages.length * HISTORY_PAGE_SIZE,
    select: (data) => data.pages.flat(),
    staleTime: 1000 * 60 * 10,
  });

/** Afsluttede ture (Turhistorik), newest first, a page at a time. */
const useItineraryHistory = (filters: ItineraryHistoryFilters) => {
  const {advancedTaskPermission} = useUser();
  return useInfiniteQuery({
    ...getItineraryHistoryOptions(filters),
    enabled: advancedTaskPermission,
  });
};

const getItineraryLinksOptions = (id: string | null) =>
  queryOptions({
    queryKey: queryKeys.Itineraries.links(id),
    queryFn: async () => {
      const {data} = await apiClient.get<Tilknytning[]>(
        `/sensor_admin/tasks/itineraries/${id}/links`
      );
      return data;
    },
    enabled: id !== null,
    staleTime: 1000 * 60 * 10,
  });

/** Every tilknytning on a tur, including ended ones. */
const useItineraryLinks = (id: string | null) => {
  const {advancedTaskPermission} = useUser();
  const options = getItineraryLinksOptions(id);
  return useQuery({
    ...options,
    enabled: advancedTaskPermission && options.enabled,
  });
};

// Module level, so the reference is stable and TanStack Query only re-runs it (and returns a
// new array) when a query result changes.
const linksData = (results: Array<{data?: Tilknytning[]}>) => results.map((result) => result.data);

/** Tilknytninger for several ture at once, in the same order as ids. */
const useItinerariesLinks = (ids: string[]) => {
  const {advancedTaskPermission} = useUser();
  return useQueries({
    queries: ids.map((id) => ({
      ...getItineraryLinksOptions(id),
      enabled: advancedTaskPermission,
    })),
    combine: linksData,
  });
};

const getItineraryForloebOptions = (id: string | null) =>
  queryOptions({
    queryKey: queryKeys.Itineraries.forloeb(id),
    queryFn: async () => {
      const {data} = await apiClient.get<TurForloebEvent[]>(
        `/sensor_admin/tasks/itineraries/${id}/forloeb`
      );
      return data;
    },
    enabled: id !== null,
    staleTime: 1000 * 60 * 10,
  });

/** The Turforløb: what happened on a tur, oldest first. */
const useItineraryForloeb = (id: string | null) => {
  const {advancedTaskPermission} = useUser();
  const options = getItineraryForloebOptions(id);
  return useQuery({
    ...options,
    enabled: advancedTaskPermission && options.enabled,
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
      toast.success('Tur afsluttet');
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

export {
  useItineraries,
  useItinerary,
  useItineraryTasks,
  useItineraryHistory,
  useItineraryLinks,
  useItinerariesLinks,
  useItineraryForloeb,
  useItineraryMutations,
};
