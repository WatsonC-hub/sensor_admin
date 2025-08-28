import {useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';

export interface Project {
  project_no: string;
  customer_name: string | null;
  project_info: string | null;
}

const useLocationProject = () => {
  const get = useQuery({
    queryKey: queryKeys.LocationProjects.all(),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Project>>(
        '/sensor_field/stamdata/location_projects'
      );
      return data;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  return {get};
};

export default useLocationProject;
