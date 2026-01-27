import {TimeseriesManager} from '../controller/TimeseriesManager';
import TimeseriesEditor from './TimeseriesEditor';
import Button from '~/components/Button';
import {Box} from '@mui/material';
import {useEffect, useState} from 'react';
import FormFieldset from '~/components/formComponents/FormFieldset';
import UnitDialog from '../components/UnitDialog';
import {onAddUnitList} from './TimeseriesStepHelper';
import {TransformedUnit} from '../controller/types';
import {AddUnitType} from '../forms/UnitForm';
import dayjs from 'dayjs';

type Props = {
  manager: TimeseriesManager | undefined;
};

function TimeseriesList({manager}: Props) {
  const [unitDialog, setUnitDialog] = useState(false);
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

  const add = () => {
    return manager?.add(crypto.randomUUID());
  };

  const remove = (id: string) => manager?.remove(id);

  return (
    <>
      <Box display="flex" gap={1} flexWrap="wrap" alignSelf={'center'}>
        <Button bttype="primary" onClick={() => add()}>
          Tilføj tidsserie
        </Button>
        <Button bttype="primary" onClick={() => setUnitDialog(true)}>
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
      <UnitDialog
        open={unitDialog}
        onClose={() => setUnitDialog(false)}
        onAddUnitList={(units) => {
          const transformedUnit: TransformedUnit[] = units.map((unit) => {
            const transformedUnit: AddUnitType = {
              unit_uuid: unit.unit_uuid,
              startdate: dayjs(unit.startdato),
              calypso_id: unit.calypso_id.toString(),
              sensor_id: unit.sensor_id,
            };

            return {
              ...transformedUnit,
              tstype_id: unit.sensortypeid,
            };
          });

          const controller_list = manager?.list().map(({agg}) => agg.getController()) || [];
          onAddUnitList(transformedUnit, controller_list, add);
        }}
      />
    </>
  );
}
export default TimeseriesList;
