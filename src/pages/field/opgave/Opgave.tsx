import React from 'react';

import {useTaskManagement} from '~/features/opgavestyring/api/useOpgaveStyring';
import {useSearchParam} from '~/hooks/useSeachParam';

type Props = {};

const Opgave = (props: Props) => {
  const [search] = useSearchParam('loc_ids', '[13237, 11455, 774]');
  const loc_ids: Array<number> = JSON.parse(search ?? '[]');

  const {
    get: {data: combinedQueries},
  } = useTaskManagement({loc_ids});

  //Lav eventuelt en hook som tager imod en liste af ts_id'er til at kalde alle 3 (service, pejling, measurements) hooks, bearbejder dataet, så der ikke opstår duplikater, håndtere fejl og return et resultat med 3 arrays en til hver.
  //Se om det er muligt at gøre det til en hel stor hook(måske overkill) som også henter data fra (adgangsinformation, kontaktinformation, huskeliste).

  console.log('render');
  // console.log(combinedQueries);
  // console.log(combinedServiceData);
  // console.log(combinedPejlingData);

  return <div>{loc_ids}</div>;
};

export default Opgave;
