//TaskSupervision
//taskManagement
//opgaveStyring
import {useQueries} from '@tanstack/react-query';

import {pejlingGetOptions} from '~/features/pejling/api/usePejling';
import {tilsynGetOptions} from '~/features/tilsyn/api/useTilsyn';
import {FieldLocation} from '~/types';
interface LocationData {
  data: Array<FieldLocation>;
  pending: boolean;
  ts_ids: Array<number>;
}

export const useLocationData = (combinedQueries: LocationData) => {
  const getService = useQueries({
    queries: combinedQueries.ts_ids.map((ts_id) => tilsynGetOptions(ts_id)),
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
      };
    },
  });

  const getPejling = useQueries({
    queries: combinedQueries.ts_ids.map((ts_id) => pejlingGetOptions(ts_id)),
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
      };
    },
  });
  return {getService, getPejling};
};
