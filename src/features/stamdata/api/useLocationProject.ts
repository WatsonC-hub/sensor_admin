import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';

export interface Project {
  project_no: string;
  customer_name: string | null;
  project_info: string | null;
}

export const getLocationProjectOptions = () => {
  return queryOptions({
    queryKey: ['location_projects'],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Project>>(
        '/sensor_field/stamdata/location_projects'
      );
      return data;
    },
  });
};

export const getLocationProjectInfoOptions = (project_no: string | undefined) => {
  return queryOptions({
    queryKey: ['location_projects', project_no],
    queryFn: async () => {
      const {data} = await apiClient.get<Project>(
        `/sensor_field/stamdata/location_projects/${project_no}`
      );
      return data;
    },
    enabled: project_no !== undefined,
  });
};

const useLocationProject = () => {
  const get = useQuery({
    queryKey: ['location_projects'],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Project>>(
        '/sensor_field/stamdata/location_projects'
      );
      return data;
    },
  });

  return {get};
};

export default useLocationProject;
