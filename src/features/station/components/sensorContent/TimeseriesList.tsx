import {Box, Typography, Link, IconButton} from '@mui/material';
import React from 'react';
import {convertDate} from '~/helpers/dateConverter';
import {useTimeseriesStatus} from '~/hooks/query/useNotificationOverview';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import {useAppContext} from '~/state/contexts';
import {CalendarIcon} from '@mui/x-date-pickers';
import {useLocationInfo} from '../../api/useLocationInfo';
import {useParkering} from '~/features/parkering/api/useParkering';
import {utm} from '~/features/map/mapConsts';
import DirectionsIcon from '@mui/icons-material/Directions';
import {useDisplayState} from '~/hooks/ui';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
const TimeseriesList = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const {station} = useNavigationFunctions();
  const [setShowLocationRouter, setShowContentOnMobile] = useDisplayState((state) => [
    state.setShowLocationRouter,
    state.setShowContentOnMobile,
  ]);
  const {data, isPending} = useTimeseriesStatus(loc_id);
  const {data: location_data} = useLocationInfo(loc_id);
  const {
    get: {data: parkings},
  } = useParkering();

  if (isPending) {
    return (
      <Box display="flex" gap={1} flexDirection={'column'}>
        {/* <TooltipWrapper description=""> */}
        <Box
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Typography variant="h6" fontWeight={'bold'}>
            Tidsserier
          </Typography>

          <IconButton
            disabled={!location_data?.x || !location_data?.y}
            onClick={() => {
              const parking = parkings?.find((p) => p.loc_id === loc_id);
              let x = location_data?.x;
              let y = location_data?.y;
              if (parking) {
                x = parking.x;
                y = parking.y;
              }

              const coords = utm.convertUtmToLatLng(x!, y!, 32, 'Z');
              if (typeof coords === 'object') {
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`,
                  '_blank'
                );
              }
            }}
            sx={{
              color: 'primary.main',
            }}
          >
            <DirectionsIcon />
          </IconButton>
        </Box>
        <Typography variant={'body2'} height={24} alignContent={'center'}>
          Indlæser...
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" gap={1} flexDirection={'column'}>
      <Box
        display={'flex'}
        flexDirection={'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <Typography variant="h6" fontWeight={'bold'}>
          Tidsserier
        </Typography>

        <div>
          <IconButton
            onClick={() => {
              if (location_data) {
                const coords = utm.convertUtmToLatLng(location_data.x, location_data.y, 32, 'Z');

                if (typeof coords === 'object') {
                  setShowContentOnMobile(false);
                  window.dispatchEvent(
                    new CustomEvent('leaflet-pan', {
                      detail: {lat: coords.lat, lng: coords.lng, zoom: 13},
                    })
                  );
                }
              }
            }}
            sx={{color: 'primary.main'}}
          >
            <FmdGoodIcon />
          </IconButton>
          <IconButton
            disabled={!location_data?.x || !location_data?.y}
            onClick={() => {
              const parking = parkings?.find((p) => p.loc_id === loc_id);
              let x = location_data?.x;
              let y = location_data?.y;
              if (parking) {
                x = parking.x;
                y = parking.y;
              }

              const coords = utm.convertUtmToLatLng(x!, y!, 32, 'Z');
              if (typeof coords === 'object') {
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`,
                  '_blank'
                );
              }
            }}
            sx={{
              color: 'primary.main',
            }}
          >
            <DirectionsIcon />
          </IconButton>
        </div>
      </Box>
      {data?.length === 0 && (
        <>
          <Typography variant={'body2'} height={24} alignContent={'center'}>
            Ingen tidsserier tilknyttet denne lokation.
          </Typography>
          <Typography
            fontSize={'small'}
            width={'fit-content'}
            sx={{cursor: 'pointer', color: 'white'}}
          >
            <Link onClick={() => setShowLocationRouter(true)}>Åben lokationssiden</Link>
          </Typography>
        </>
      )}

      {data?.map((timeseries, index) => {
        return (
          <Box key={index} display="flex" justifyContent={'space-between'} alignItems="center">
            <Box display="flex" gap={1} sx={{cursor: 'pointer', color: 'white'}}>
              <NotificationIcon
                iconDetails={{
                  notification_id: timeseries.notification_id,
                  flag: timeseries.flag,
                  not_serviced: timeseries.not_serviced,
                  inactive_new: timeseries.inactive,
                  in_service: timeseries.in_service,
                }}
              />
              <Typography fontSize={'small'} width={'fit-content'}>
                <Link onClick={() => station(timeseries.ts_id)}>
                  {timeseries.prefix ? timeseries.prefix + ' - ' : ''} {timeseries.parameter}
                  {timeseries.flag != null && ': ' + timeseries.opgave}
                </Link>
              </Typography>
            </Box>
            {timeseries.due_date && (
              <Box display="flex" gap={1} color="grey.700">
                <CalendarIcon fontSize="small" />
                <Typography variant="caption" alignContent={'center'} color="grey.700">
                  {convertDate(timeseries.due_date)}
                </Typography>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default TimeseriesList;
