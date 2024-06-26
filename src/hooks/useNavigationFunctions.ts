import {useMemo} from 'react';
import {NavigateOptions, useNavigate} from 'react-router-dom';

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
    ) =>
      navigate(
        {
          pathname: '/field/location/' + loc_id + '/' + station_id,
        },
        options
      ),
    stamdata: (
      loc_id: number,
      station_id: number,
      tabValue: string = '0',
      options?: NavigateOptions
    ) =>
      navigate(
        '/field/location/' + loc_id + '/' + station_id + '?page=stamdata&tab=' + tabValue,
        options
      ),
    borehole: (boreholeno: string, options?: NavigateOptions) =>
      navigate('/field/borehole/' + boreholeno, options),
    boreholeIntake: (boreholeno: string, intake: string | number, options?: NavigateOptions) =>
      navigate('/field/borehole/' + boreholeno + '/' + intake, options),
    createStamdata: () => navigate('/field/stamdata'),
  };

  const out = useMemo(() => {
    return {
      ...homeFunctions,
      ...adminFunctions,
      ...fieldFunctions,
    };
  }, []);

  return out;
};
