import {Box, Tooltip} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import moment from 'moment';
import React from 'react';

import {apiClient} from '~/apiClient';
import BatteryIndicator from '~/components/BatteryIndicator';
import {BatteryStatusType} from '~/types';

type BatteryStatusProps = {
  ts_id: string;
};

const BatteryStatus = ({ts_id}: BatteryStatusProps) => {
  const {data: battery_status} = useQuery({
    queryKey: ['battery_status', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<BatteryStatusType>(
        `/sensor_field/station/battery_status/${ts_id}`
      );
      return data;
    },
    enabled: ts_id !== undefined && ts_id !== null && ts_id !== '',
  });

  let tooltipText = '';

  const currentDate = moment();
  const estimatedDate = moment(battery_status?.estimated_no_battery);

  const years = estimatedDate.diff(currentDate, 'years');
  currentDate.add(years, 'years');
  const months = estimatedDate.diff(currentDate, 'months');
  currentDate.add(months, 'months');
  const days = estimatedDate.diff(currentDate, 'days');

  if (
    battery_status &&
    (battery_status.battery_percentage == null ||
      moment(battery_status.estimated_no_battery).toISOString() < moment().toISOString() ||
      moment(battery_status.enddate).toISOString() <= moment().toISOString())
  ) {
    tooltipText = 'Batteri status er ikke tilgængeligt';
  }

  let text = '';
  if (years !== 0) {
    text += years + ' år';
  }

  let monthText = 'måned';
  if (months > 1) monthText = 'måneder';
  if (months !== 0 && days === 0) {
    text += ' og ' + months + ' måneder';
  } else if (months !== 0) {
    text += ' ' + months + ' ' + monthText;
  }

  if (battery_status?.battery_percentage != null) {
    tooltipText = `Procent: ${(battery_status?.battery_percentage * 100).toFixed()} %\nEstimeret levetid: ${text}`;
  }

  return (
    <>
      {battery_status && (
        <Tooltip arrow title={<Box whiteSpace="pre-line">{tooltipText}</Box>} enterTouchDelay={0}>
          <Box height="24px">
            <BatteryIndicator percentage={(battery_status.battery_percentage ?? 0) * 100} />
          </Box>
        </Tooltip>
      )}
    </>
  );
};

export default BatteryStatus;
