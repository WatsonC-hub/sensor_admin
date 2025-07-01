import {useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';

export interface Project {
  project_no: string;
  customer_name: string | null;
  project_info: string | null;
}

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
