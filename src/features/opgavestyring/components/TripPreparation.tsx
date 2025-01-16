import {Box, Typography} from '@mui/material';
import React from 'react';

import TripContactTable from '~/features/opgavestyring/components/TripContactTable';
import TripKeysTable from '~/features/opgavestyring/components/TripKeysTable';
import TripRessourcesTable from '~/features/opgavestyring/components/TripRessourcesTable';
import TripUnitTable from '~/features/opgavestyring/components/TripUnitTable';
import {TaskCollection} from '~/types';

interface TripPreparationProps {
  data: TaskCollection | undefined;
}

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
    </Box>
  );
};

export default TripPreparation;
