import TimeseriesEditor from './TimeseriesEditor';
import Button from '~/components/Button';
import {Box} from '@mui/material';
import {useState} from 'react';
import FormFieldset from '~/components/formComponents/FormFieldset';
import UnitDialog from '../components/UnitDialog';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {AddUnitType} from '../forms/UnitForm';
import dayjs from 'dayjs';
import {TransformedUnit} from '../types';

function TimeseriesList() {
  const [unitDialog, setUnitDialog] = useState(false);
  const [timeseries, setState, deleteState, removeSubmitter] = useCreateStationStore((state) => [
    state.formState.timeseries,
    state.setState,
    state.deleteState,
    state.removeSubmitter,
  ]);

  const add = () => {
    const uuid = crypto.randomUUID();
    setState(`timeseries.${uuid}`, {});
    return uuid;
  };

  const remove = (index: string) => {
    deleteState(`timeseries.${index}`);
    removeSubmitter(`timeseries.${index}.meta`);
  };

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
      {Object.entries(timeseries ?? {})?.map(([id], index) => {
        return (
          <FormFieldset
            key={id}
            label={`Tidsserie ${index + 1}`}
            sx={{width: '100%', p: 1, mb: 2}}
            labelPosition={-20}
          >
            <TimeseriesEditor key={id} index={id} onRemove={() => remove(id)} />
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
              startdate: dayjs(),
              calypso_id: unit.calypso_id.toString(),
            };
            return {
              ...transformedUnit,
              tstype_id: unit.sensortypeid,
            };
          });

          transformedUnit.forEach((unit) => {
            const uuid = add();
            setState(`timeseries.${uuid}.meta`, {tstype_id: unit.tstype_id});
            setState(`timeseries.${uuid}.unit`, unit);
          });
        }}
      />
    </>
  );
}
export default TimeseriesList;
