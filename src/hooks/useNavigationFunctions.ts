// import {parseAsArrayOf, parseAsInteger, useQueryState} from 'nuqs';
import {useMemo} from 'react';
import {NavigateOptions, useNavigate} from 'react-router-dom';

import {useDisplayState} from './ui';

export const useNavigationFunctions = () => {
  const navigate = useNavigate();

  const {setLocId, setTsId, setBoreholeNo, setIntakeNo, reset} = useDisplayState((state) => {
    return {
      setLocId: state.setLocId,
      setTsId: state.setTsId,
      setBoreholeNo: state.setBoreholeNo,
      setIntakeNo: state.setIntakeNo,
      reset: state.reset,
    };
  });

  const homeFunctions = {
    home: () => {
      navigate('/', {replace: true});
      reset();
    },
  };

  const adminFunctions = {
    tasks: () => navigate('/admin/opgaver'),
  };

  const fieldFunctions = {
    location: (loc_id: number, navigateHome?: boolean) => {
      if (navigateHome) homeFunctions.home();
      setLocId(loc_id);
    },
    station: (ts_id: number, navigateHome?: boolean) => {
      if (navigateHome) homeFunctions.home();
      setTsId(ts_id);
    },
    boreholeIntake: (boreholeno: string, intake: number) => {
      setBoreholeNo(boreholeno);
      setIntakeNo(intake);
    },
    createStamdata: (options?: NavigateOptions) => {
      navigate('/stamdata', options);
    },
    dataOverblik: (options?: NavigateOptions) => {
      navigate('/overview/data-overblik', options);
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
