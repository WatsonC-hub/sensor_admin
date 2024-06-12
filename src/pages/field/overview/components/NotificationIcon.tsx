import {BatteryAlertRounded, Circle} from '@mui/icons-material';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
import CycloneIcon from '@mui/icons-material/Cyclone';
import DangerousIcon from '@mui/icons-material/Dangerous';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import HeightIcon from '@mui/icons-material/Height';
import HourglassDisabledIcon from '@mui/icons-material/HourglassDisabled';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import RunningWithErrorsIcon from '@mui/icons-material/RunningWithErrors';
import SpeedIcon from '@mui/icons-material/Speed';
import TerrainIcon from '@mui/icons-material/Terrain';
import {Avatar, Tooltip} from '@mui/material';

//Imports
import {TableData} from '~/types';

export const statusStyling = (flagColor: string) => {
  return {
    bgcolor: flagColor,
    textAlign: 'center',
    width: 36,
    height: 36,
  };
};

export const defaultStyling = (FlagColor: string) => {
  return {
    color: FlagColor ?? '#00FF00',
    textAlign: 'start',
    width: 36,
    height: 36,
  };
};

const NotificationIcon = (tableData: TableData, isDetailPanel: boolean = false) => {
  let icon = <Circle sx={defaultStyling(tableData.color)} />;

  if ((tableData.notification_id === 0 || tableData.flag === -1) && !isDetailPanel)
    return (
      <Tooltip arrow title={tableData.opgave} enterTouchDelay={0}>
        {icon}
      </Tooltip>
    );
  else if ((tableData.notification_id === 0 || tableData.flag === -1) && isDetailPanel) return icon;

  switch (tableData.flag) {
    case 0:
      switch (tableData.notification_id) {
        case 10:
          icon = <HeightIcon />;
          break;
        case 9:
          icon = <CycloneIcon />;
          break;
        case 11:
          icon = <HeightIcon />;
          break;
        case 13:
          icon = <CrisisAlertIcon />;
          break;
        case 12:
          icon = <TerrainIcon />;
          break;
        case 75:
          icon = <HeightIcon />;
          break;
        case 76:
          icon = <HeightIcon />;
          break;
      }
      break;
    case 1:
      switch (tableData.notification_id) {
        case 6:
          icon = <NotificationImportantIcon />;
          break;
        case 7:
          icon = <SpeedIcon />;
          break;
        case 1:
          icon = <BatteryAlertRounded />;
          break;
      }
      break;
    case 2:
      switch (tableData.notification_id) {
        case 5:
          icon = <EventBusyIcon />;
          break;
        case 8:
          icon = <EventBusyIcon />;
          break;
      }
      break;
    case 3:
      switch (tableData.notification_id) {
        case 3:
          icon = <HourglassDisabledIcon />;
          break;
        case 2:
          icon = <QueryStatsIcon />;
          break;
        case 42:
          icon = <CloudOffIcon />;
          break;
        case 4:
          icon = <DangerousIcon />;
          break;
        case 108:
          icon = <RunningWithErrorsIcon />;
          break;
      }
      break;
  }

  if (isDetailPanel) return <Avatar sx={statusStyling(tableData.color)}>{icon}</Avatar>;
  else
    return (
      <Avatar sx={statusStyling(tableData.color)}>
        <Tooltip arrow title={tableData.opgave} enterTouchDelay={0}>
          {icon}
        </Tooltip>
      </Avatar>
    );
};

export default NotificationIcon;
