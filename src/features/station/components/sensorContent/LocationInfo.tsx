import {Box, Chip, Grid2, Link, Typography} from '@mui/material';
import React from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {getGroupLink} from '~/helpers/links';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useAppContext} from '~/state/contexts';
import {useLocationInfo} from '../../api/useLocationInfo';
import {useTimeseriesStatus} from '~/hooks/query/useNotificationOverview';
import {useStationPages} from '~/hooks/useQueryStateParameters';
import {useDisplayState} from '~/hooks/ui';
import Button from '~/components/Button';

const LocationInfo = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const [setTsId] = useDisplayState((state) => [state.setTsId]);
  const {data: location_data} = useLocationInfo(loc_id);
  const {data: timeseriesList} = useTimeseriesStatus(loc_id);
  const [, setPageToShow] = useStationPages();

  const {isMobile} = useBreakpoints();

  return (
    <Box display={'flex'} flexDirection={'column'} mt={-2} gap={0.5}>
      <Typography variant={'h6'} fontWeight={'bold'}>
        {location_data?.loc_name}
      </Typography>
      {location_data?.customer_name !== null && location_data?.customer_name !== undefined && (
        <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
          <Typography variant={'body2'} height={24} alignContent={'center'}>
            Projektinfo:{' '}
          </Typography>
          <Typography variant={'body2'} height={24} alignContent={'center'}>
            {location_data?.customer_name}
          </Typography>
        </Box>
      )}

      {location_data?.projectno !== null && location_data?.projectno !== undefined && (
        <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
          <Typography variant={'body2'} height={24} alignContent={'center'}>
            Projekt nr.:{' '}
          </Typography>
          <Box display={'flex'} flexDirection={'row'} gap={1}>
            <Typography variant={'body2'} height={24} alignContent={'center'}>
              {location_data?.projectno}
            </Typography>
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
          <Typography variant={'body2'} height={24} alignContent={'center'}>
            Lokationstype:
          </Typography>
          <Typography variant={'body2'} height={24} alignContent={'center'}>
            {location_data?.loctype_name}
          </Typography>
        </Box>
      )}
      {location_data?.groups && location_data?.groups.length > 0 && (
        <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
          <Typography variant={'body2'} alignContent={'center'}>
            Grupper:
          </Typography>
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
      {location_data?.ressources && location_data.ressources.length > 0 && (
        <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
          <Typography variant={'body2'} alignContent={'center'}>
            Huskeliste:
          </Typography>
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
                <Chip
                  variant="outlined"
                  size="small"
                  label={
                    <Button
                      bttype="link"
                      sx={{
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      {ressource}
                    </Button>
                  }
                  onClick={() => {
                    setTsId(timeseriesList?.[0].ts_id ?? null);
                    setPageToShow('huskeliste');
                  }}
                />
              </Grid2>
            ))}
          </Grid2>
        </Box>
      )}
      {location_data?.location_access && location_data.location_access.length > 0 && (
        <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
          <Typography variant={'body2'} alignContent={'center'}>
            Nøgler:
          </Typography>
          <Grid2
            container
            gap={0.25}
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'end'}
            alignItems={'center'}
          >
            {location_data.location_access.map((key) => (
              <Grid2
                size={undefined}
                display={'flex'}
                flexDirection={'row'}
                justifyContent={'flex-end'}
                alignItems={'center'}
                alignContent={'center'}
                key={key}
              >
                <Chip
                  variant="outlined"
                  size="small"
                  label={
                    <Button
                      bttype="link"
                      sx={{
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      {key}
                    </Button>
                  }
                  onClick={() => {
                    setTsId(timeseriesList?.[0].ts_id ?? null);
                    setPageToShow('nøgler');
                  }}
                />
              </Grid2>
            ))}
          </Grid2>
        </Box>
      )}
      {location_data?.contact && (
        <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
          <Typography variant={'body2'} alignContent={'center'}>
            Kontakter:
          </Typography>
          <Grid2
            container
            gap={0.25}
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'end'}
            alignItems={'center'}
          >
            <Chip
              variant="outlined"
              size="small"
              label={
                <Button
                  bttype="link"
                  sx={{
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  {'Åbn kontakter'}
                </Button>
              }
              onClick={() => {
                setTsId(timeseriesList?.[0].ts_id ?? null);
                setPageToShow('kontakter');
              }}
            />
          </Grid2>
        </Box>
      )}
    </Box>
  );
};

export default LocationInfo;
