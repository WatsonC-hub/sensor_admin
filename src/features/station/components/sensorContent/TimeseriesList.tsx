import {Box, Typography, Link} from '@mui/material';
import React from 'react';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {useTimeseriesStatus} from '~/hooks/query/useNotificationOverview';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import {useAppContext} from '~/state/contexts';
import {CalendarIcon} from '@mui/x-date-pickers';

const TimeseriesList = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const {station} = useNavigationFunctions();

  const {data, isPending} = useTimeseriesStatus(loc_id);

  if (isPending) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box display="flex" gap={1} flexDirection={'column'}>
      <Typography variant="h6" fontWeight={'bold'}>
        Tidsserier
      </Typography>
      {data?.map((timeseries, index) => {
        return (
          <Box key={index} display="flex" justifyContent={'space-between'} alignItems="center">
            <Box display="flex" gap={1} sx={{cursor: 'pointer'}}>
              <NotificationIcon iconDetails={timeseries} />
              <Typography fontSize={'small'} width={'fit-content'}>
                <Link onClick={() => station(timeseries.ts_id)}>
                  {timeseries.prefix ? timeseries.prefix + ' - ' : ''} {timeseries.parameter}
                  {timeseries.flag != null && ': ' + timeseries.opgave}
                </Link>
              </Typography>
            </Box>
            {timeseries.has_task && (
              <Box display="flex" gap={1} color="grey.700">
                <CalendarIcon fontSize="small" />
                <Typography variant="caption" alignContent={'center'} color="grey.700">
                  {convertDateWithTimeStamp(timeseries?.due_date)}
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
