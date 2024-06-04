import {NavigateOptions, useNavigate} from 'react-router-dom';
import {boolean} from 'zod';

export const useNavigationFunctions = () => {
  const navigate = useNavigate();

  const homeFunctions = {
    home: () => navigate('/'),
    register: () => navigate('/register'),
  };

  const adminFunctions = {
    admin: () => navigate('/admin'),
    adminNotifikationer: () => navigate('/admin/notifikationer'),
    adminKvalitetssikring: (ts_id: number) => navigate('/admin/kvalitetssikring/' + ts_id),
  };

  const fieldFunctions = {
    field: () => navigate('/field'),
    location: (loc_id: number, options?: NavigateOptions) =>
      navigate('/field/location/' + loc_id, options),
    station: (
      loc_id: number | undefined,
      station_id: number | undefined,
      options?: NavigateOptions
    ) => navigate('/field/location/' + loc_id + '/' + station_id, options),
    borehole: (boreholeno: string, options?: NavigateOptions) =>
      navigate('/field/borehole/' + boreholeno, options),
    boreholeIntake: (boreholeno: string, intake: string, options?: NavigateOptions) =>
      navigate('/field/borehole/' + boreholeno + '/' + intake, options),
    createStamdata: () => navigate('/field/stamdata'),
  };

  return {
    ...homeFunctions,
    ...adminFunctions,
    ...fieldFunctions,
  };
};
