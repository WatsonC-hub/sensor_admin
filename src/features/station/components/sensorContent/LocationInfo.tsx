import {Box, Link, Typography} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {getLocationProjectInfoOptions} from '~/features/stamdata/api/useLocationProject';
import {useLocationData} from '~/hooks/query/useMetadata';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {getLocationTypeInfoOptions} from '~/features/stamdata/api/useLocationType';

const LocationInfo = () => {
  const {data: location_data} = useLocationData();
  const {data: project_info} = useQuery(getLocationProjectInfoOptions(location_data?.projectno));
  const {data: location_type_info} = useQuery(
    getLocationTypeInfoOptions(location_data?.loctype_id)
  );

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
    </Box>
  );
};

export default LocationInfo;
