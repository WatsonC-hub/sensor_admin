import {Box, Typography} from '@mui/material';
import React from 'react';

// import TripContactTable from '~/features/opgavestyring/components/TripContactTable';
// import TripKeysTable from '~/features/opgavestyring/components/TripKeysTable';
import TripRessourcesTable from '~/features/opgavestyring/components/TripRessourcesTable';
import TripUnitTable from '~/features/opgavestyring/components/TripUnitTable';
import {TaskCollection} from '~/types';
import TripTaskTable from './TripTaskTable';
import TripTaskCardList from './TripTaskCardList';
import Button from '~/components/Button';

interface TripPreparationProps {
  data: TaskCollection | undefined;
}

const TripPreparation = ({data}: TripPreparationProps) => {
  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      gap={1}
      // sx={{paddingBottom: 'env(--safe-area-inset-bottom, 16px)'}}
    >
      {/* <Typography ml={2} variant="h5">
        Kontakter
      </Typography>
      <TripContactTable contacts={data?.contacts} />

      <Typography ml={2} variant="h5">
        Nøgler
      </Typography>
      <TripKeysTable keys={data?.location_access} />*/}

      <Typography ml={2} variant="h5">
        Pakkeliste
      </Typography>
      <TripRessourcesTable ressources={data?.ressourcer} />

      <TripTaskTable tasks={data?.tasks} />
      <TripTaskCardList data={data} />

      <Typography ml={2} variant="h5">
        Udstyr
      </Typography>
      <TripUnitTable units={data?.units} />

      <Box display="flex" gap={1} flexDirection={'row'} alignSelf={'center'}>
        <Button bttype="tertiary" sx={{borderRadius: 2.5}}>
          Start rute
        </Button>
        <Button bttype="primary" sx={{borderRadius: 2.5}}>
          Åben Google Maps
        </Button>
      </Box>
    </Box>
  );
};

export default TripPreparation;
