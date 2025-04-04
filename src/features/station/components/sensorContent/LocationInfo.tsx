import {Box, Grid2, Link, Typography} from '@mui/material';
import React from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {Group} from '~/types';
import {getGroupLink} from '~/helpers/links';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useAppContext} from '~/state/contexts';
import useLocationInfo from '../../api/useLocationInfo';

const LocationInfo = () => {
  const {loc_id} = useAppContext(['loc_id']);

  const {data: location_data} = useLocationInfo(loc_id);

  const {isMobile} = useBreakpoints();

  return (
    <Box display={'flex'} flexDirection={'column'}>
      <Typography variant={'h6'} fontWeight={'bold'}>
        {location_data?.loc_name}
      </Typography>
      <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
        <Typography variant={'body2'}>Projekt info: </Typography>
        <Typography variant={'body2'}>{location_data?.customer_name}</Typography>
      </Box>

      <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
        <Typography variant={'body2'}>Projekt nr.: </Typography>
        <Box display={'flex'} flexDirection={'row'} gap={1}>
          <Typography variant={'body2'}>{location_data?.projectno}</Typography>
          <Link
            href={`https://www.watsonc.dk/calypso/projekt/?project=${location_data?.projectno}`}
            target="_blank"
            rel="noopener"
          >
            <OpenInNewIcon fontSize="small" />
          </Link>
        </Box>
      </Box>
      <Box display={'flex'} flexDirection={'row'} gap={1} justifyContent={'space-between'}>
        <Typography variant={'body2'}>Lokationstype:</Typography>
        <Typography variant={'body2'}>{location_data?.loctype_name}</Typography>
      </Box>
      <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
        <Typography variant={'body2'}>Grupper:</Typography>
        <Grid2 container gap={0.25} display={'flex'} flexDirection={'row'} justifyContent={'end'}>
          {location_data && (
            <>
              {location_data.groups?.map((group, index, groups) => {
                const newGrp = {} as Group;

                if (typeof group === 'object' && 'id' in group) {
                  newGrp.id = (group as Group).id;
                  newGrp.group_name = (group as Group).group_name;
                }

                return (
                  <Grid2
                    size={isMobile ? 6 : undefined}
                    display={'flex'}
                    flexDirection={'row'}
                    justifyContent={'flex-end'}
                    key={newGrp.id}
                  >
                    <Link href={getGroupLink(newGrp.id)} key={newGrp.id}>
                      <Typography variant="caption">{newGrp.group_name}</Typography>
                    </Link>
                    {groups.length - 1 !== index && !isMobile && (
                      <Typography variant="caption"> | </Typography>
                    )}
                  </Grid2>
                );
              })}
            </>
          )}
        </Grid2>
      </Box>
    </Box>
  );
};

export default LocationInfo;
