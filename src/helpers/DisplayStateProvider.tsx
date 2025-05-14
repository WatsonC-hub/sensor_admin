import {useQueryState, parseAsInteger, parseAsString} from 'nuqs';
import {useEffect} from 'react';
import {useDisplayState, displayStore} from '~/hooks/ui';

const DisplayStateProvider = ({children}: {children: React.ReactNode}) => {
  // Read from URL
  const [ts_id, setTsIdQuery] = useQueryState('ts_id', parseAsInteger);
  const [loc_id, setLocIdQuery] = useQueryState('loc_id', parseAsInteger);
  const [boreholeno, setBoreholeNoQuery] = useQueryState('boreholeno', parseAsString);
  const [intakeno, setIntakeNoQuery] = useQueryState('intakeno', parseAsInteger);

  // Zustand store
  const {setTsId, setLocId, setBoreholeNo, setIntakeNo} = useDisplayState((state) => ({
    setTsId: state.setTsId,
    setLocId: state.setLocId,
    setBoreholeNo: state.setBoreholeNo,
    setIntakeNo: state.setIntakeNo,
  }));

  // console.log('ts_id', ts_id);
  // Sync Zustand with URL params on mount
  useEffect(() => {
    if (loc_id) setLocId(loc_id);
    if (ts_id) setTsId(ts_id);
    if (boreholeno) setBoreholeNo(boreholeno);
    if (intakeno) setIntakeNo(intakeno);
  }, []);

  // Sync Zustand state to URL whenever it changes
  useEffect(() => {
    const unsubscribe = displayStore.subscribe((state) => {
      setTsIdQuery(state.ts_id);
      setLocIdQuery(state.loc_id);
      setBoreholeNoQuery(state.boreholeno);
      setIntakeNoQuery(state.intakeno);
    });

    return () => unsubscribe();
  }, [setTsIdQuery, setLocIdQuery, setBoreholeNoQuery, setIntakeNoQuery]);

  return <>{children}</>;
};

export default DisplayStateProvider;
