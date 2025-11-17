import {Box, Tooltip} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import moment from 'moment';
import React from 'react';

import {apiClient} from '~/apiClient';
import BatteryIndicator from '~/components/BatteryIndicator';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {useAppContext} from '~/state/contexts';
import {BatteryStatusType} from '~/types';

const estimatedText = (years: number, months: number, days: number): string => {
  const parts: string[] = [];

  if (years) parts.push(`${years} år`);
  if (months) parts.push(`${months} ${months > 1 ? 'måneder' : 'måned'}`);
  if (days) parts.push(`${days} ${days > 1 ? 'dage' : 'dag'}`);

  if (parts.length === 0) return '0 dage'; // fallback if all are zero
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts.join(' og ');

  // more than two → join with commas, 'og' before last
  return parts.slice(0, -1).join(', ') + ' og ' + parts.at(-1);
};

const BatteryStatus = () => {
  const {ts_id} = useAppContext([], ['ts_id']);
  const {data: battery_status} = useQuery({
    queryKey: queryKeys.Timeseries.batteryStatus(ts_id),
    queryFn: async () => {
      const {data} = await apiClient.get<BatteryStatusType>(
        `/sensor_field/station/battery_status/${ts_id}`
      );
      return data;
    },
    enabled: ts_id !== undefined && ts_id !== null,
    staleTime: 1000 * 60 * 60,
  });

  if (!battery_status) {
    return null;
  }

  const currentDate = moment();
  const estimatedDate = moment(battery_status.estimated_no_battery);

  const years = estimatedDate.diff(currentDate, 'years');
  currentDate.add(years, 'years');
  const months = estimatedDate.diff(currentDate, 'months');
  currentDate.add(months, 'months');
  const days = estimatedDate.diff(currentDate, 'days');

  const text = estimatedText(years, months, days);
  const timeText =
    battery_status.current_bat !== null ? 'Estimeret levetid' : 'Tid til batteriskift';

  const tooltipText = battery_status.is_powered
    ? 'Enhed sidder til faststrøm'
    : battery_status.current_bat !== null
      ? `Procent: ${(battery_status?.battery_percentage * 100).toFixed()} %\n${timeText}: ${text}`
      : `${timeText}: ${text}`;

  return (
    <>
      {battery_status && (
        <Tooltip arrow title={<Box whiteSpace="pre-line">{tooltipText}</Box>} enterTouchDelay={0}>
          <Box height="24px" onClick={() => {}}>
            <BatteryIndicator
              isPowered={battery_status.is_powered}
              percentage={(battery_status.battery_percentage ?? 0) * 100}
            />
          </Box>
        </Tooltip>
      )}
    </>
  );
};

export default BatteryStatus;
