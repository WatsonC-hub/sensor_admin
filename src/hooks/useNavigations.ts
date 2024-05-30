import {useNavigate} from 'react-router-dom';
import {boolean} from 'zod';

export const useNavigations = () => {
  const navigate = useNavigate();

  return {
    field: () => navigate('/field'),
    admin: () => navigate('/admin'),
    location: (loc_id: number) => navigate('/field/location/' + loc_id),
    station: (loc_id: number, station_id: number) =>
      navigate('/field/location/' + loc_id + '/' + station_id),
    borehole: (boreholeno: string) => navigate('/field/borehole/' + boreholeno),
    boreholeIntake: (boreholeno: string, intake: string) =>
      navigate('/field/borehole/' + boreholeno + '/' + intake),
  };
};
