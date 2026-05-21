import {DmpSyncValidCombination} from '~/types';

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
