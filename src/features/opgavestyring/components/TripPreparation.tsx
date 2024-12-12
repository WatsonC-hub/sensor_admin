import {Box, Typography} from '@mui/material';
import React from 'react';

import NotificationList from '~/components/NotificationList';
import TripContactTable from '~/features/opgavestyring/components/TripContactTable';
import TripKeysTable from '~/features/opgavestyring/components/TripKeysTable';
import TripRessourcesTable from '~/features/opgavestyring/components/TripRessourcesTable';
import TripUnitTable from '~/features/opgavestyring/components/TripUnitTable';
import TaskTable from '~/features/tasks/components/TaskTable';
import {TaskCollection} from '~/types';

interface TripPreparationProps {
  data: TaskCollection | undefined;
}

//Jeg kunne ikke lige finde en god måde at genbruge tasktable, men det kan være du kan Mathias. Ellers så må vi lave en ny minimal table til opgaver.
//Udover at tabellen er for høj på desktop, så ser tabellen fint nok ud.
//Problemet opstår på mobilen, da vi har en masse funktionalitet liggende på top toolbar.

const TripPreparation = ({data}: TripPreparationProps) => {
  return (
    <Box display={'flex'} flexDirection={'column'} gap={2}>
      <Typography ml={2} variant="h5">
        Kontakter
      </Typography>
      <TripContactTable contacts={data?.contacts} />
      <Typography ml={2} variant="h5">
        Nøgler
      </Typography>
      <TripKeysTable keys={data?.location_access} />
      <Typography ml={2} variant="h5">
        Ressourcer
      </Typography>
      <TripRessourcesTable ressources={data?.ressourcer} />
      <Typography ml={2} variant="h5">
        Udstyr
      </Typography>

      <TripUnitTable units={data?.units} />
      {/* <Typography ml={2} variant="h5">
        Notifikationer
      </Typography>
      <NotificationList />
      <Typography ml={2} variant="h5">
        Opgaver
      </Typography> */}
    </Box>
  );
};

export default TripPreparation;
