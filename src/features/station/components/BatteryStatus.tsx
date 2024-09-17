import {
  Battery1Bar,
  Battery2Bar,
  Battery3Bar,
  Battery4Bar,
  Battery5Bar,
  Battery6Bar,
  BatteryAlert,
  BatteryFull,
} from '@mui/icons-material';
import {Tooltip} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import moment from 'moment';
import React from 'react';

import {apiClient} from '~/apiClient';
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

  let icon;
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
    icon = <BatteryAlert />;
  }

  let text = '';
  if (years !== 0) {
    text += years + ' år';
  }

  let monthText = 'måned';
  if (months > 1) monthText = 'måneder';
  if (months !== 0 && days === 0) {
    text += ' og ' + months + ' måeneder';
  } else if (months !== 0) {
    text += ' ' + months + ' ' + monthText;
  }

  let dayText = 'dag';
  if (days > 1) dayText = 'dage';
  if (days !== 0) {
    text += ' og ' + days + ' ' + dayText;
  }
  if (battery_status && battery_status.battery_percentage !== null) {
    tooltipText = 'Estimeret levetid: ' + text;
    switch (true) {
      case battery_status.battery_percentage < 0.142:
        icon = <Battery1Bar />;
        break;
      case battery_status.battery_percentage < 0.285:
        icon = <Battery2Bar />;
        break;
      case battery_status.battery_percentage < 0.428:
        icon = <Battery3Bar />;
        break;
      case battery_status.battery_percentage < 0.571:
        icon = <Battery4Bar />;
        break;
      case battery_status.battery_percentage < 0.714:
        icon = <Battery5Bar />;
        break;
      case battery_status.battery_percentage < 0.857:
        icon = <Battery6Bar />;
        break;
      default:
        icon = <BatteryFull />;
    }
  }

  return (
    <div style={{height: 24}}>
      {battery_status && (
        <Tooltip arrow title={tooltipText} enterTouchDelay={0}>
          {icon!}
        </Tooltip>
      )}
    </div>
  );
};

export default BatteryStatus;
