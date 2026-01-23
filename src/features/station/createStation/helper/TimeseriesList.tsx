import {TimeseriesManager} from '../controller/TimeseriesManager';
import TimeseriesEditor from './TimeseriesEditor';
import Button from '~/components/Button';
import {Box} from '@mui/material';
import {useEffect, useState} from 'react';

type Props = {
  manager: TimeseriesManager;
  AddByUnit: () => void;
};

function TimeseriesList({manager, AddByUnit}: Props) {
  const [tick, setTick] = useState(0);

  // subscribe to manager changes
  useEffect(() => {
    const unsubscribe = manager.onChange(() => {
      setTick((x) => x + 1);
    });

    return () => {
      console.log('TimeseriesList unsubscribing from manager changes', tick);
      unsubscribe();
    }; // ✅ cleanup
  }, [manager]);

  const add = () => manager.add(crypto.randomUUID());
  const remove = (id: string) => manager.remove(id);

  return (
    <>
      <Box display="flex" gap={1} flexWrap="wrap">
        <Button bttype="primary" onClick={() => add()}>
          Tilføj tidsserie
        </Button>
        <Button bttype="primary" onClick={AddByUnit}>
          Tilføj fra udstyr
        </Button>
      </Box>
      {manager.list().map(({id, agg}) => {
        return <TimeseriesEditor key={id} aggregate={agg} onRemove={() => remove(id)} />;
      })}
    </>
  );
}
export default TimeseriesList;
