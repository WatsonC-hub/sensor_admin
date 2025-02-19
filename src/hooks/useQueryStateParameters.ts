import {useQueryState, parseAsStringLiteral, parseAsBoolean} from 'nuqs';

import {qaAdjustmentLiteral, qaPages, qaPagesLiteral, stationPages} from '~/helpers/EnumHelper';

const editTabValues = [
  'lokation',
  'tidsserie',
  'udstyr',
  'målepunkt',
  'stationsinformation',
] as const;

const createTabValues = ['lokation', 'tidsserie', 'udstyr'] as const;

export const useQAPageState = () => {
  return useQueryState(
    'page',
    parseAsStringLiteral(qaPagesLiteral).withDefault(qaPages.JUSTERINGER)
  );
};

export function useShowFormState() {
  return useQueryState('showForm', parseAsBoolean);
}

export const useEditTabState = () => {
  return useQueryState('tab', parseAsStringLiteral(editTabValues).withDefault('lokation'));
};

export const useCreateTabState = () => {
  return useQueryState('tab', parseAsStringLiteral(createTabValues).withDefault('lokation'));
};

export function useStationPages() {
  return useQueryState(
    'page',
    parseAsStringLiteral(Object.values(stationPages)).withDefault(stationPages.PEJLING)
  );
}

export const useAdjustmentState = () => {
  return useQueryState('adjust', parseAsStringLiteral(qaAdjustmentLiteral));
};
