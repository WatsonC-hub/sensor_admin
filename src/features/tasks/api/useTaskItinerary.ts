import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
// import {Notification} from '~/hooks/query/useNotificationOverview';
import {APIError} from '~/queryClient';

import type {
  completeItinerary,
  PatchTaskitinerary,
  PostTaskitinerary,
  Task,
  Taskitinerary,
  // DeleteTaskFromItinerary,
  // MoveTaskToDifferentItinerary,
} from '../types';

// type Mutation<TData> = {
//   path: string;
//   data: TData;
// };

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

// export const deleteTaskFromItineraryOptions = {
//   mutationKey: ['taskItinerary_delete'],
//   mutationFn: async (mutation_data: DeleteTaskFromItinerary) => {
//     const {path} = mutation_data;
//     const {data: result} = await apiClient.delete(`/sensor_admin/tasks/itineraries/${path}`);
//     return result;
//   },
// };

// export const moveTasksToItineraryOptions = {
//   mutationKey: ['taskItinerary_move'],
//   mutationFn: async (mutation_data: MoveTaskToDifferentItinerary) => {
//     const {path, data} = mutation_data;
//     const {data: result} = await apiClient.post(`/sensor_admin/tasks/itineraries/${path}`, data);
//     return result;
//   },
// };

export const useTaskItinerary = (id?: string) => {
  const queryClient = useQueryClient();

  const get = useQuery<Taskitinerary[], APIError>({
    queryKey: ['itineraries'],
    queryFn: async () => {
      const {data} = await apiClient.get('/sensor_admin/tasks/itineraries');
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const getItineraryTasks = useQuery<Task[], APIError>({
    queryKey: ['itineraries', id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_admin/tasks/itineraries/${id}/tasks`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    enabled: id !== undefined,
  });

  const post = useMutation<unknown, APIError, PostTaskitinerary>({
    ...itineraryPostOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['itineraries'],
      });

      queryClient.invalidateQueries({
        queryKey: ['tasks'],
      });
      toast.success('Tur oprettet');
    },
  });

  const patch = useMutation<unknown, APIError, PatchTaskitinerary>({
    ...patchItineraryOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['itineraries'],
      });
      toast.success('Tur opdateret');
    },
  });

  const complete = useMutation<unknown, APIError, completeItinerary>({
    ...completeItineraryOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['itineraries'],
      });
      toast.success('Tur færdiggjort');
    },
  });

  // const deleteTaskFromItinerary = useMutation<unknown, APIError, DeleteTaskFromItinerary>({
  //   ...deleteTaskFromItineraryOptions,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ['itineraries', id],
  //     });
  //     toast.success('opgave slettet fra tur');
  //   },
  // });

  // const moveTasks = useMutation<unknown, APIError, MoveTaskToDifferentItinerary>({
  //   ...moveTasksToItineraryOptions,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ['itineraries', id],
  //     });
  //     toast.success('Opgaver tilføjet til tur');
  //   },
  // });

  return {
    get,
    post,
    patch,
    getItineraryTasks,
    complete,
    // deleteTaskFromItinerary,
    // moveTasks,
    // getProjects,
  };
};
