import {Box, Chip, Grid2, Link, Typography} from '@mui/material';
import React from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {getGroupLink} from '~/helpers/links';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useAppContext} from '~/state/contexts';
import {useLocationInfo} from '../../api/useLocationInfo';

const LocationInfo = () => {
  const {loc_id} = useAppContext(['loc_id']);

  const {data: location_data} = useLocationInfo(loc_id);

  const {isMobile} = useBreakpoints();

  return (
    <Box display={'flex'} flexDirection={'column'} mt={-2} gap={0.5}>
      <Typography variant={'h6'} fontWeight={'bold'}>
        {location_data?.loc_name}
      </Typography>
      {location_data?.customer_name !== null && location_data?.customer_name !== undefined && (
        <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
          <Typography variant={'body2'}>Projektinfo: </Typography>
          <Typography variant={'body2'}>{location_data?.customer_name}</Typography>
        </Box>
      )}

      {location_data?.projectno !== null && location_data?.projectno !== undefined && (
        <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
          <Typography variant={'body2'}>Projekt nr.: </Typography>
          <Box display={'flex'} flexDirection={'row'} gap={1} alignItems={'center'}>
            <Typography variant={'body2'}>{location_data?.projectno}</Typography>
            <Link
              href={`https://www.watsonc.dk/calypso/projekt/?project=${location_data?.projectno}`}
              target="_blank"
              rel="noopener"
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <OpenInNewIcon
                sx={{
                  fontSize: '1rem',
                }}
              />
            </Link>
          </Box>
        </Box>
      )}
      {location_data?.loctype_name !== undefined && (
        <Box display={'flex'} flexDirection={'row'} gap={1} justifyContent={'space-between'}>
          <Typography variant={'body2'}>Lokationstype:</Typography>
          <Typography variant={'body2'}>{location_data?.loctype_name}</Typography>
        </Box>
      )}
      {location_data?.groups && location_data?.groups.length > 0 && (
        <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
          <Typography variant={'body2'}>Grupper:</Typography>
          <Grid2 container gap={0.25} display={'flex'} flexDirection={'row'} justifyContent={'end'}>
            {location_data && (
              <>
                {location_data.groups?.map((group) => {
                  return (
                    <Grid2
                      size={undefined}
                      display={'flex'}
                      flexDirection={'row'}
                      justifyContent={'flex-end'}
                      key={group.id}
                    >
                      <Chip
                        variant="outlined"
                        size="small"
                        label={
                          <Box
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: isMobile ? '100px' : '150px',
                            }}
                          >
                            <Link href={getGroupLink(group.id)} key={group.id}>
                              {group.group_name}
                            </Link>
                          </Box>
                        }
                      />
                    </Grid2>
                  );
                })}
              </>
            )}
          </Grid2>
        </Box>
      )}
      {location_data?.ressources && location_data?.ressources.length > 0 && (
        <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
          <Typography variant={'body2'}>Huskeliste:</Typography>
          <Grid2
            container
            gap={0.25}
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'end'}
            alignItems={'center'}
          >
            {location_data.ressources.map((ressource) => (
              <Grid2
                size={undefined}
                display={'flex'}
                flexDirection={'row'}
                justifyContent={'flex-end'}
                alignItems={'center'}
                alignContent={'center'}
                key={ressource}
              >
                <Chip variant="outlined" size="small" label={ressource} />
              </Grid2>
            ))}
          </Grid2>
        </Box>
      )}
    </Box>
  );
};

export default LocationInfo;
