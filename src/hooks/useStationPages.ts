import {parseAsStringLiteral, useQueryState} from 'nuqs';

import {stationPages} from '~/helpers/EnumHelper';

export function useStationPages() {
  return useQueryState(
    'page',
    parseAsStringLiteral(Object.values(stationPages)).withDefault('pejling')
  );
}
