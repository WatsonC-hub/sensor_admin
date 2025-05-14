// import {parseAsArrayOf, parseAsInteger, useQueryState} from 'nuqs';
import {useMemo} from 'react';
import {NavigateOptions, useNavigate} from 'react-router-dom';

import {ID} from '~/features/tasks/types';
import {useDisplayState} from './ui';

export const useNavigationFunctions = () => {
  const navigate = useNavigate();

  const {setLocId, setTsId, setBoreholeNo, setIntakeNo} = useDisplayState((state) => {
    return {
      setLocId: state.setLocId,
      setTsId: state.setTsId,
      setBoreholeNo: state.setBoreholeNo,
      setIntakeNo: state.setIntakeNo,
    };
  });

  const homeFunctions = {
    home: () => navigate('/', {replace: true}),
    register: () => navigate('/register'),
  };

  const adminFunctions = {
    admin: () => navigate('/admin'),
    adminNotifikationer: () => navigate('/admin/notifikationer'),
    adminKvalitetssikring: (ts_id: number) => navigate('/admin/kvalitetssikring/' + ts_id),
    tasks: () => navigate('/admin/opgaver'),
    taskManagement: (id: ID) => {
      navigate({
        pathname: '/admin/opgaver/tur/' + id,
      });
      // setLocIds(loc_ids);
    },
    taskManagementSearch: (loc_ids: number[]) => {
      navigate({
        pathname: '/admin/opgaver/tur',
        search: loc_ids.length > 0 ? '?loc_ids=' + loc_ids.join(',') : '',
      });
      // setLocIds(loc_ids);
    },
  };

  const fieldFunctions = {
    field: () => navigate('/field'),
    location: (loc_id: number) => setLocId(loc_id),
    station: (ts_id: number) => setTsId(ts_id),

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
      navigate('/borehole/' + boreholeno, options),
    boreholeIntake: (boreholeno: string, intake: number) => {
      setBoreholeNo(boreholeno);
      setIntakeNo(intake);
    },
    createStamdata: (options?: NavigateOptions) => {
      navigate('/stamdata', options);
    },
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
