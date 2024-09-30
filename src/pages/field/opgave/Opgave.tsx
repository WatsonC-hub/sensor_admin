import {useQueries, useQuery} from '@tanstack/react-query';
import React from 'react';

import {apiClient} from '~/apiClient';
import {pejlingGetOptions} from '~/features/pejling/api/usePejling';
import {tilsynGetOptions} from '~/features/tilsyn/api/useTilsyn';
import {useSearchParam} from '~/hooks/useSeachParam';

type Props = {};

const Opgave = (props: Props) => {
  const [search, setLocIds] = useSearchParam('loc_ids', '[13237, 11455, 774]');
  const loc_ids = JSON.parse(search ?? '[]') as number[];

  const combinedQueries = useQueries({
    queries: loc_ids.map((loc_id) => ({
      queryKey: ['stations', loc_id],
      queryFn: async () => {
        const {data} = await apiClient.get(`/sensor_field/station/metadata_location/${loc_id}`);
        return data;
      },
      enabled: loc_id !== undefined,
    })),
    combine: (results) => {
      return {
        data: results.map((result) => result.data).flat(),
        pending: results.some((result) => result.isPending),
        ts_ids:
          results && results.map((result) => result.data && result.data.map((elem) => elem.ts_id)),
      };
    },
  });

  const combinedServiceData = useQueries({
    queries: combinedQueries.ts_ids.map((ts_id) => tilsynGetOptions(ts_id)),
    combine: (results) => {
      return {
        data: results.map((result) => result.data).flat(),
      };
    },
  });

  const combinedPejlingData = useQueries({
    queries: combinedQueries.ts_ids.map((ts_id) => pejlingGetOptions(ts_id)),
    combine: (results) => {
      return {
        data: results.map((result) => result.data).flat(),
      };
    },
  });

  //Lav eventuelt en hook som tager imod en liste af ts_id'er til at kalde alle 3 (service, pejling, measurements) hooks, bearbejder dataet, så der ikke opstår duplikater, håndtere fejl og return et resultat med 3 arrays en til hver.
  //Se om det er muligt at gøre det til en hel stor hook(måske overkill) som også henter data fra (adgangsinformation, kontaktinformation, huskeliste).

  console.log('render');
  // console.log(combinedQueries);
  // console.log(combinedServiceData);
  // console.log(combinedPejlingData);

  return <div>{loc_ids}</div>;
};

export default Opgave;
