import {queryOptions, useMutation, useQuery} from '@tanstack/react-query';
import {Group as LocationGroup} from '~/types';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';

export type Group = {
  id: string;
  loc_id: number;
  group_name: string;
  locations: Array<Location> | null;
};

export type Location = {
  loc_id: number;
  loc_name: string;
  loctype: string;
};

type AddLocationPayload = {
  path: string;
  data: {
    loc_id: number | undefined;
  };
};

type MoveLocationPayload = {
  path: string;
  data: {
    group_id: string;
    loc_id: number | undefined;
  };
};

type RemoveLocationPayload = {
  path: string;
  data: {
    loc_id: number | undefined;
  };
};

const groupGetOptions = queryOptions({
  queryKey: ['lookup_groups', 'metadata'],
  queryFn: async () => {
    // Fetch groups from API
    const {data} = await apiClient.get<Array<Group>>('/overview/groups');

    return data;
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
});

const useGroups = () => {
  const get = useQuery(groupGetOptions);

  const get_group_options = useQuery({
    queryKey: ['group_options', 'metadata'],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<LocationGroup>>('/overview/available_groups');
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const add_location = useMutation({
    mutationKey: ['group_add_location'],
    mutationFn: async (mutation_data: AddLocationPayload) => {
      const {path, data} = mutation_data;
      const {data: response} = await apiClient.post(`/overview/add_location/${path}`, data);
      return response;
    },
    meta: {
      invalidates: [['metadata']],
    },
  });

  const move_location = useMutation({
    mutationKey: ['group_move_location'],
    mutationFn: async (mutation_data: MoveLocationPayload) => {
      const {path, data} = mutation_data;
      const {data: response} = await apiClient.post(`/overview/move_location/${path}`, data);
      return response;
    },
    onSuccess: () => {
      toast.success('Lokation flyttet');
    },
    meta: {
      invalidates: [['metadata']],
    },
  });

  const remove_location = useMutation({
    mutationKey: ['group_remove_location'],
    mutationFn: async (mutation_data: RemoveLocationPayload) => {
      const {path, data} = mutation_data;
      const {data: response} = await apiClient.post(`/overview/remove_location/${path}`, data);
      return response;
    },
    onSuccess: () => {
      toast.success('Lokation fjernet');
    },
    meta: {
      invalidates: [['metadata']],
    },
  });

  return {
    get,
    get_group_options,
    add_location,
    move_location,
    remove_location,
  };
};

export default useGroups;
