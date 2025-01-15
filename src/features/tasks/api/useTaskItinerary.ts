import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
// import {Notification} from '~/hooks/query/useNotificationOverview';
import {APIError} from '~/queryClient';

import type {
  ID,
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

export const useTaskItinerary = (id?: ID) => {
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
      toast.success('Opgaver gemt');
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
    getItineraryTasks,
    // deleteTaskFromItinerary,
    // moveTasks,
    // getProjects,
  };
};
