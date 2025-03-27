import {Box, Grid2, Link, Typography} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {getLocationProjectInfoOptions} from '~/features/stamdata/api/useLocationProject';
import {useLocationData} from '~/hooks/query/useMetadata';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {getLocationTypeInfoOptions} from '~/features/stamdata/api/useLocationType';
import {Group} from '~/types';
import {getGroupLink} from '~/helpers/links';
import useBreakpoints from '~/hooks/useBreakpoints';

const LocationInfo = () => {
  const {data: location_data} = useLocationData();
  const {data: project_info} = useQuery(getLocationProjectInfoOptions(location_data?.projectno));
  const {data: location_type_info} = useQuery(
    getLocationTypeInfoOptions(location_data?.loctype_id)
  );

  const {isMobile} = useBreakpoints();

  return (
    <Box display={'flex'} flexDirection={'column'}>
      <Typography variant={'h6'} fontWeight={'bold'}>
        {location_data?.loc_name}
      </Typography>
      <Box
        display={'flex'}
        flexDirection={'row'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Typography variant={'body2'}>Projekt info: </Typography>
        <Typography variant={'body2'}>{project_info?.customer_name}</Typography>
      </Box>

      <Box
        display={'flex'}
        flexDirection={'row'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Typography variant={'body2'}>Projekt nr.: </Typography>
        <Box display={'flex'} flexDirection={'row'} gap={1} alignItems={'center'}>
          <Typography variant={'body2'}>{project_info?.project_no} </Typography>
          <Link
            href={`https://www.watsonc.dk/calypso/projekt/?project=${project_info?.project_no}`}
            target="_blank"
            rel="noopener"
          >
            <OpenInNewIcon />
          </Link>
        </Box>
      </Box>
      <Box
        display={'flex'}
        flexDirection={'row'}
        alignItems={'center'}
        gap={1}
        justifyContent={'space-between'}
      >
        <Typography variant={'body2'}>Lokationstype:</Typography>
        <Typography variant={'body2'}>{location_type_info?.loctypename}</Typography>
      </Box>
      <Box
        display={'flex'}
        flexDirection={'row'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Typography variant={'body2'}>Grupper:</Typography>
        <Grid2
          container
          gap={0.25}
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'end'}
          alignItems={'center'}
        >
          {location_data && (
            <>
              {location_data.groups.map((group, index, groups) => {
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
