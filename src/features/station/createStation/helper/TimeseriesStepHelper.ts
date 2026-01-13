import dayjs from 'dayjs';
import {
  FieldArrayWithId,
  UseFieldArrayRemove,
  UseFieldArrayUpdate,
  UseFormGetValues,
} from 'react-hook-form';
import {Unit} from '~/features/stamdata/api/useAddUnit';
import {FormState, MetaType} from '~/helpers/CreateStationContextProvider';

export const typeSelectChanged = (
  event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  index: number,
  field: FieldArrayWithId<{timeseries: FormState['timeseries']}, 'timeseries', 'id'>,
  meta: MetaType | null,
  setMeta: React.Dispatch<React.SetStateAction<MetaType | null>>,
  onValidate: (key: keyof FormState, data: FormState[keyof FormState], index?: number) => void,
  units: FormState['units'],
  update: UseFieldArrayUpdate<{timeseries: FormState['timeseries']}, 'timeseries'>,
  watlevmpIndex: Array<number>,
  removeWatlevmpAtIndex: (index: number) => void,
  getValues: UseFormGetValues<{timeseries: FormState['timeseries']}>
) => {
  const value = event.target.value;
  const existingTstypeIds = [...(meta?.tstype_id || [])];

  const tstypeIndex = existingTstypeIds.findIndex((_, i) => i === index);

  if (tstypeIndex !== -1) {
    existingTstypeIds[tstypeIndex] = parseInt(value);
  } else {
    existingTstypeIds.push(parseInt(value));
  }

  if (field.unit_uuid) {
    onValidate('units', units?.filter((u) => u.unit_uuid !== field.unit_uuid) || []);
  }

  update(index, {
    ...field,
    prefix: getValues('timeseries')?.[index]?.prefix,
    tstype_id: parseInt(value),
    unit_uuid: undefined,
  });

  setMeta((prev) => ({
    ...prev,
    tstype_id: existingTstypeIds,
  }));

  if (value != '1' && watlevmpIndex.includes(index)) {
    removeWatlevmpAtIndex(index);
  }
};

export const removeTimeseries = (
  index: number,
  field: FieldArrayWithId<{timeseries: FormState['timeseries']}, 'timeseries', 'id'>,
  meta: MetaType | null,
  setMeta: React.Dispatch<React.SetStateAction<MetaType | null>>,
  onValidate: (key: keyof FormState, data: FormState[keyof FormState], index?: number) => void,
  timeseries: FormState['timeseries'],
  units: FormState['units'],
  remove: UseFieldArrayRemove,
  removeWatlevmpAtIndex: (index: number) => void
) => {
  remove(index);
  const updatedTstypeIds = meta?.tstype_id?.filter((_, i) => i !== index);
  setMeta((prev) => ({
    ...prev,
    tstype_id: updatedTstypeIds,
  }));

  if (field.unit_uuid) {
    onValidate('units', units?.filter((u) => u.unit_uuid !== field.unit_uuid) || []);
  }

  onValidate(
    'timeseries',
    timeseries?.filter((_, i) => i !== index)
  );

  removeWatlevmpAtIndex(index);
};

export const onUnitValidate = (
  unit: Unit,
  index: number,
  field: FieldArrayWithId<{timeseries: FormState['timeseries']}, 'timeseries', 'id'>,
  onValidate: (key: keyof FormState, data: FormState[keyof FormState], index?: number) => void,
  units: FormState['units'],
  update: UseFieldArrayUpdate<{timeseries: FormState['timeseries']}, 'timeseries'>
) => {
  const updated_units = [
    ...(units || []),
    {
      unit_uuid: unit.unit_uuid,
      calypso_id: unit.calypso_id,
      sensor_id: unit.sensor_id,
      startdate: dayjs(),
      sensortypeid: unit.sensortypeid,
    },
  ];
  onValidate('units', updated_units);
  update(index, {
    ...field,
    unit_uuid: unit.unit_uuid,
  });
};

export const onUnitListValidate = (
  validate_units: Array<Unit>,
  onValidate: (key: keyof FormState, data: FormState[keyof FormState], index?: number) => void,
  timeseries: FormState['timeseries'],
  units: FormState['units']
) => {
  const unit_timeseries = validate_units.map((unit) => ({
    prefix: undefined,
    intakeno: undefined,
    tstype_id: unit.sensortypeid,
    unit_uuid: unit.unit_uuid,
    sensor_id: unit.sensor_id,
  }));

  const updated_timeseries = [...(timeseries || []), ...unit_timeseries];
  onValidate('timeseries', updated_timeseries);
  onValidate('units', [
    ...(units || []),
    ...validate_units.map((u) => {
      return {
        unit_uuid: u.unit_uuid,
        calypso_id: u.calypso_id,
        sensor_id: u.sensor_id,
        startdate: dayjs(),
        sensortypeid: u.sensortypeid,
      };
    }),
  ]);
};
