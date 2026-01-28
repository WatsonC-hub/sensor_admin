import {DmpSyncValidCombination} from '~/types';
import {TimeseriesController, TransformedUnit} from '../controller/types';
import {TimeseriesAggregate} from '../controller/TimeseriesAggregate';

export const isSynchronizationAllowed = (
  tstype_id: number | undefined,
  loctype_id: number | undefined,
  dmpAllowedMapList: Array<DmpSyncValidCombination> | undefined
): boolean => {
  const isJupiterType = [1, 11, 12, 16].includes(tstype_id || 0);
  const isBorehole = loctype_id === 9;
  const canSyncJupiter = isBorehole && isJupiterType;
  const isDmpAllowed = dmpAllowedMapList?.some((combination) => {
    return combination.loctype_id === loctype_id && combination.tstype_id === tstype_id;
  });

  return isDmpAllowed || canSyncJupiter;
};

export const onAddUnitList = (
  units: TransformedUnit[],
  timeseriesControllerList: Array<TimeseriesController> | undefined,
  add: () => TimeseriesAggregate | undefined
) => {
  units.forEach((unit) => {
    const aggregate = add();
    if (!aggregate) return;
    const controller = aggregate.getController();
    controller.registerSlice('meta', true, () => Promise.resolve(true));
    controller.registerSlice('unit', true, () => Promise.resolve(true));
    controller.updateSlice('meta', true, {tstype_id: unit.tstype_id});
    controller.updateSlice('unit', true, unit);
    timeseriesControllerList?.push(controller);
  });
};
