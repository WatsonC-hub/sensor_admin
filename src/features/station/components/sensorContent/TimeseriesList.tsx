import DirectionsIcon from '@mui/icons-material/Directions';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import {Box, IconButton, Link, Typography} from '@mui/material';
import {CalendarIcon} from '@mui/x-date-pickers';
import {useAtomValue} from 'jotai';
import React from 'react';

import {utm, zoomAtom} from '~/features/map/mapConsts';
import {useParkering} from '~/features/parkering/api/useParkering';
import {convertDate} from '~/helpers/dateConverter';
import {useTimeseriesStatus} from '~/hooks/query/useNotificationOverview';
import {useDisplayState} from '~/hooks/ui';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import {useAppContext} from '~/state/contexts';

import {useLocationInfo} from '../../api/useLocationInfo';
const TimeseriesList = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const {station} = useNavigationFunctions();
  const [setShowLocationRouter, setHideSensorContent] = useDisplayState((state) => [
    state.setShowLocationRouter,
    state.setHideSensorContent,
  ]);
  const zoom = useAtomValue(zoomAtom);
  const {isMobile} = useBreakpoints();
  const {data, isPending} = useTimeseriesStatus(loc_id);
  const {data: location_data} = useLocationInfo(loc_id);
  const {
    get: {data: parkings},
  } = useParkering();

  if (isPending) {
    return (
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexDirection: 'column',
        }}
      >
        {/* <TooltipWrapper description=""> */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
            }}
          >
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
        <Typography
          variant={'body2'}
          sx={{
            height: 24,
            alignContent: 'center',
          }}
        >
          Indlæser...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
          }}
        >
          Tidsserier
        </Typography>

        <div>
          <IconButton
            onClick={() => {
              if (location_data) {
                const coords = utm.convertUtmToLatLng(location_data.x, location_data.y, 32, 'Z');

                if (typeof coords === 'object') {
                  if (isMobile) setHideSensorContent(true);
                  window.dispatchEvent(
                    new CustomEvent('leaflet-pan', {
                      detail: {lat: coords.lat, lng: coords.lng, zoom: zoom},
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
          <Typography
            variant={'body2'}
            sx={{
              height: 24,
              alignContent: 'center',
            }}
          >
            Ingen tidsserier tilknyttet denne lokation.
          </Typography>
          <Typography
            sx={{
              fontSize: 'small',
              width: 'fit-content',
              cursor: 'pointer',
              color: 'white',
            }}
          >
            <Link onClick={() => setShowLocationRouter(true)}>Åben lokationssiden</Link>
          </Typography>
        </>
      )}
      {data?.map((timeseries, index) => {
        return (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                cursor: 'pointer',
                color: 'white',
              }}
            >
              <NotificationIcon
                iconDetails={{
                  notification_id: timeseries.notification_id,
                  flag: timeseries.flag,
                  not_serviced: timeseries.not_serviced,
                  inactive_new: timeseries.inactive,
                  in_service: timeseries.in_service,
                }}
              />
              <Typography
                sx={{
                  fontSize: 'small',
                  width: 'fit-content',
                }}
              >
                <Link onClick={() => station(timeseries.ts_id)}>
                  {timeseries.prefix ? timeseries.prefix + ' - ' : ''} {timeseries.parameter}
                  {timeseries.flag != null && ': ' + timeseries.opgave}
                </Link>
              </Typography>
            </Box>
            {timeseries.due_date && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  color: 'grey.700',
                }}
              >
                <CalendarIcon fontSize="small" />
                <Typography
                  variant="caption"
                  sx={{
                    alignContent: 'center',
                    color: 'grey.700',
                  }}
                >
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
