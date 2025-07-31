import {useQueryState, parseAsStringLiteral, parseAsBoolean} from 'nuqs';
import {fragments} from '~/features/overview/consts';

import {qaAdjustmentLiteral, stationPages} from '~/helpers/EnumHelper';

const createTabValues = ['lokation', 'tidsserie', 'udstyr'] as const;

export function useStationPages() {
  return useQueryState(
    'page',
    parseAsStringLiteral(Object.values(stationPages)).withDefault(stationPages.PEJLING)
  );
}

export function useDataFragmentState() {
  return useQueryState(
    'overblik',
    parseAsStringLiteral(Object.values(fragments)).withDefault(fragments.projects)
  );
}

export function useShowFormState() {
  return useQueryState('showForm', parseAsBoolean);
}

export const useCreateTabState = () => {
  return useQueryState('tab', parseAsStringLiteral(createTabValues).withDefault('lokation'));
};

export const useAdjustmentState = () => {
  return useQueryState('adjust', parseAsStringLiteral(qaAdjustmentLiteral));
};
