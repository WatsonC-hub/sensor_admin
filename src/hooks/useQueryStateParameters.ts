import {useQueryState, parseAsStringLiteral, parseAsBoolean} from 'nuqs';

import {qaAdjustmentLiteral, stationPages} from '~/helpers/EnumHelper';

export function useStationPages() {
  return useQueryState(
    'page',
    parseAsStringLiteral(Object.values(stationPages)).withDefault(stationPages.PEJLING)
  );
}

export function useShowFormState() {
  return useQueryState('showForm', parseAsBoolean);
}

export const useAdjustmentState = () => {
  return useQueryState('adjust', parseAsStringLiteral(qaAdjustmentLiteral));
};
