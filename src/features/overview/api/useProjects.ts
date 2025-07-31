import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';

export type Project = {
  project_no: string;
  project_info: string;
  customer_name: string;
  project_title: string;
  is_customer_service: boolean;
};

const projectGetOptions = queryOptions({
  queryKey: ['lookup_projects'],
  queryFn: async () => {
    // Fetch projects from API
    const {data} = await apiClient.get<Array<Project>>('/overview/projects');

    return data;
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
});

const useProjects = () => {
  const get = useQuery(projectGetOptions);

  return {
    get,
  };
};

export default useProjects;
