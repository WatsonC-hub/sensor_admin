//TaskSupervision
//taskManagement
//opgaveStyring
import {useQueries} from '@tanstack/react-query';
import moment from 'moment';

import {pejlingGetOptions} from '~/features/pejling/api/usePejling';
import {tilsynGetOptions} from '~/features/tilsyn/api/useTilsyn';
import {FieldLocation, TilsynItem} from '~/types';
interface LocationData {
  data: Array<FieldLocation>;
  pending: boolean;
  ts_ids: Array<number>;
}

export const useLocationData = (combinedQueries: LocationData) => {
  console.log(combinedQueries);
  const getService = useQueries({
    queries: combinedQueries.ts_ids
      .flat()
      .filter((ts_id) => ts_id !== null)
      .map((ts_id) => tilsynGetOptions<Array<TilsynItem>>(ts_id)),
    combine: (results) => {
      return {
        data: results.map(
          (result) =>
            result.data?.sort(
              (a, b) => moment(a.dato).milliseconds() - moment(b.dato).milliseconds()
            )[0]
        ),
      };
    },
  });

  const getPejling = useQueries({
    queries: combinedQueries.ts_ids
      .flat()
      .filter((ts_id) => ts_id !== null)
      .map((ts_id) => pejlingGetOptions(ts_id)),
    combine: (results) => {
      return {
        data: results.map(
          (result) =>
            result.data?.sort(
              (a, b) => moment(a.timeofmeas).milliseconds() - moment(b.timeofmeas).milliseconds()
            )[0]
        ),
      };
    },
  });
  return {getService, getPejling};
};
