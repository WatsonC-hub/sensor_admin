import {Box, Tooltip} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';

import {apiClient} from '~/apiClient';
import BatteryIndicator from '~/components/BatteryIndicator';
import {estimatedBatteryStatus, toISOString} from '~/helpers/dateConverter';
import {useAppContext} from '~/state/contexts';
import {BatteryStatusType} from '~/types';

const BatteryStatus = () => {
  const {ts_id} = useAppContext([], ['ts_id']);
  const {data: battery_status} = useQuery({
    queryKey: ['battery_status', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<BatteryStatusType>(
        `/sensor_field/station/battery_status/${ts_id}`
      );
      return data;
    },
    enabled: ts_id !== undefined && ts_id !== null,
  });

  let tooltipText = '';

  const estimated_text = estimatedBatteryStatus(battery_status?.estimated_no_battery);

  if (
    battery_status &&
    (battery_status.battery_percentage == null ||
      toISOString(battery_status.estimated_no_battery) < toISOString() ||
      toISOString(battery_status.enddate) <= toISOString())
  ) {
    tooltipText = 'Batteri status er ikke tilgængeligt';
  }

  if (battery_status?.battery_percentage != null) {
    tooltipText = `Procent: ${(battery_status?.battery_percentage * 100).toFixed()} %\nEstimeret levetid: ${estimated_text}`;
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
