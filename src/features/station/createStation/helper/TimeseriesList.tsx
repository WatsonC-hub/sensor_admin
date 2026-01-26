import {TimeseriesManager} from '../controller/TimeseriesManager';
import TimeseriesEditor from './TimeseriesEditor';
import Button from '~/components/Button';
import {Box} from '@mui/material';
import {useEffect, useState} from 'react';
import FormFieldset from '~/components/formComponents/FormFieldset';

type Props = {
  manager: TimeseriesManager | undefined;
  AddByUnit: () => void;
};

function TimeseriesList({manager, AddByUnit}: Props) {
  const [, setTick] = useState(0);

  // subscribe to manager changes
  useEffect(() => {
    const unsubscribe = manager?.onChange(() => {
      setTick((x) => x + 1);
    });

    return () => {
      unsubscribe?.();
    }; // ✅ cleanup
  }, [manager]);

  const add = () => manager?.add(crypto.randomUUID());
  const remove = (id: string) => manager?.remove(id);

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
      {manager?.list().map(({id, agg}, index) => {
        return (
          <FormFieldset
            key={id}
            label={`Tidsserie ${index + 1}`}
            sx={{width: '100%', p: 1, mb: 2}}
            labelPosition={-20}
          >
            <TimeseriesEditor key={id} aggregate={agg} onRemove={() => remove(id)} />
          </FormFieldset>
        );
      })}
    </>
  );
}
export default TimeseriesList;
