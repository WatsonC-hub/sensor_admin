import {useQueryState, parseAsInteger, parseAsString} from 'nuqs';
import {useRawTaskStore} from '~/features/tasks/store';

export const useDisplayStation = () => {
  const [ts_id, setTsId] = useQueryState('ts_id', parseAsInteger);
  return {
    ts_id,
    setTsId,
  };
};

const useLocIdQueryState = () => useQueryState('loc_id', parseAsInteger);
const useBoreholeNoQueryState = () => useQueryState('boreholeno', parseAsString);

export const useDisplayLocationInfo = () => {
  const [loc_id, setLocId] = useLocIdQueryState();
  const {setTsId} = useDisplayStation();
  const [, setBoreholeNo] = useBoreholeNoQueryState();
  const {setIntakeNo} = useDisplayBoreholePage();

  const handleSetLocId = (loc_id: number | null) => {
    setLocId(loc_id);
    setTsId(null);
    setBoreholeNo(null);
    setIntakeNo(null);
  };

  return {
    loc_id,
    setLocId: handleSetLocId,
    closeLocation: () => setLocId(null),
  };
};

export const useDisplayBoreholeInfo = () => {
  const [boreholeno, setBoreholeNo] = useBoreholeNoQueryState();
  const {setIntakeNo} = useDisplayBoreholePage();
  const [, setLocId] = useLocIdQueryState();
  const {setTsId} = useDisplayStation();

  const handleSetBoreholeNo = (boreholeno: string | null) => {
    setBoreholeNo(boreholeno);
    setIntakeNo(null);
    setLocId(null);
    setTsId(null);
  };

  return {
    boreholeno,
    setBoreholeNo: handleSetBoreholeNo,
  };
};

export const useDisplayBoreholePage = () => {
  const [intakeno, setIntakeNo] = useQueryState('intakeno', parseAsInteger);

  return {
    intakeno,
    setIntakeNo,
  };
};

export const useDisplaySelectedTask = () => {
  const [selectedTask, setSelectedTask] = useRawTaskStore((state) => [
    state.selectedTaskId,
    state.setSelectedTask,
  ]);

  return {
    selectedTask,
    setSelectedTask,
  };
};

export const useLocationList = () => {};
