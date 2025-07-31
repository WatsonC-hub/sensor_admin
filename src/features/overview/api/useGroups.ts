import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';

export type Group = {
  group_name: string;
  locations: Array<Location> | null;
};

export type Location = {
  loc_id: number;
  loc_name: string;
  loctype: string;
};

const groupGetOptions = queryOptions({
  queryKey: ['lookup_groups'],
  queryFn: async () => {
    // Fetch groups from API
    const {data} = await apiClient.get<Array<Group>>('/overview/groups');

    return data;
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
});

const useGroups = () => {
  const get = useQuery(groupGetOptions);

  return {
    get,
  };
};

export default useGroups;
