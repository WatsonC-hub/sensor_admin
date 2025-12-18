import {Box, Chip, Grid2, Link, Typography} from '@mui/material';
import React from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {getGroupLink} from '~/helpers/links';
import {useAppContext} from '~/state/contexts';
import {useLocationInfo} from '../../api/useLocationInfo';
import {useTimeseriesStatus} from '~/hooks/query/useNotificationOverview';
import {useStationPages} from '~/hooks/useQueryStateParameters';
import {useDisplayState} from '~/hooks/ui';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useUser} from '~/features/auth/useUser';

const LocationInfo = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const [setTsId, setShowLocationRouter] = useDisplayState((state) => [
    state.setTsId,
    state.setShowLocationRouter,
  ]);
  const {data: location_data} = useLocationInfo(loc_id);
  const {data: timeseriesList} = useTimeseriesStatus(loc_id);
  const [, setPageToShow] = useStationPages();
  const {isMobile} = useBreakpoints();
  const {superUser} = useUser();

  const isDGU = location_data?.loctype_name === 'DGU boring';
  return (
    <Box display={'flex'} flexDirection={'column'} mt={-2} gap={0.5}>
      <Typography display={'flex'} flexDirection={'column'} variant={'h6'}>
        {isDGU ? (
          <Link
            color="inherit"
            href={`https://data.geus.dk/JupiterWWW/borerapport.jsp?dgunr=${location_data.boreholeno}`}
            target={!isMobile ? '_blank' : undefined}
            rel={!isMobile ? 'noopener' : undefined}
            sx={{
              cursor: 'pointer',
              textDecorationColor: 'rgba(0, 0, 0, 0.4)',
            }}
          >
            {location_data?.loc_name}
          </Link>
        ) : (
          location_data?.loc_name
        )}
        {location_data?.sla !== undefined && location_data.sla > 0 && superUser && (
          <Typography mt={-1} ml={2} fontStyle={'italic'} fontWeight={'bold'} variant={'caption'}>
            SLA: {location_data?.sla} {location_data.sla > 1 ? 'dage' : 'dag'}
          </Typography>
        )}
      </Typography>
      {location_data?.customer_name !== null && location_data?.customer_name !== undefined && (
        <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'} gap={1}>
          <Typography variant={'body2'} height={24} alignContent={'center'}>
            Projektinfo:
          </Typography>
          <Typography variant={'body2'} minHeight={24} alignContent={'center'}>
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
            <Typography variant={'body2'} minHeight={24} alignContent={'center'}>
              {location_data?.projectno}
            </Typography>
            <Link
              href={`https://www.watsonc.dk/calypso/projekt/?project=${location_data?.projectno}`}
              target={!isMobile ? '_blank' : undefined}
              rel={!isMobile ? 'noopener' : undefined}
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
          <Typography variant={'body2'} minHeight={24} alignContent={'center'}>
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
            {location_data.groups.map((group) => {
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
                      <Link
                        href={getGroupLink(group.id)}
                        target={!isMobile ? '_blank' : undefined}
                        rel={!isMobile ? 'noopener' : undefined}
                        key={group.id}
                      >
                        {group.group_name}
                      </Link>
                    }
                  />
                </Grid2>
              );
            })}
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
                  label={<Link>{ressource}</Link>}
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
                  label={<Link>{key}</Link>}
                  onClick={() => {
                    if (timeseriesList?.length === 0) setShowLocationRouter(true);
                    else setTsId(timeseriesList?.[0].ts_id ?? null);
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
              label={<Link>{'Åbn kontakter'}</Link>}
              onClick={() => {
                if (timeseriesList?.length === 0) setShowLocationRouter(true);
                else setTsId(timeseriesList?.[0].ts_id ?? null);
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
