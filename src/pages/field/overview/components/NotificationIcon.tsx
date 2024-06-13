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

export const statusStyling = (flagColor: string) => {
  return {
    bgcolor: flagColor,
    textAlign: 'center',
    // width: 36,
    // height: 36,
  };
};

// export const defaultStyling = () => {
//   return {
//     textAlign: 'start',
//     fontSize: 'inherit',
//     // width: 36,
//     // height: 36,
//   };
// };

const defaultStyling = {
  textAlign: 'start',
  fontSize: 'inherit',
  // width: 36,
  // height: 36,
};

type IconDetails = {
  color: string;
  notification_id?: number;
  flag?: number;
  opgave?: string;
};

type IconDetailsWithTooltip = IconDetails & {
  opgave: string;
};

type NotificationIconProps =
  | {
      iconDetails: IconDetailsWithTooltip;
      enableTooltip?: true;
    }
  | {
      iconDetails: IconDetails;
      enableTooltip?: false;
    };

const NotificationIcon = ({iconDetails, enableTooltip = false}: NotificationIconProps) => {
  let icon = <Circle sx={{...defaultStyling, color: iconDetails}} />;

  if (
    (iconDetails.notification_id === 0 ||
      iconDetails.flag === -1 ||
      iconDetails.notification_id == undefined) &&
    enableTooltip
  )
    return (
      <Tooltip arrow title={iconDetails.opgave} enterTouchDelay={0}>
        {icon}
      </Tooltip>
    );
  else if (
    (iconDetails.notification_id === 0 ||
      iconDetails.flag === -1 ||
      iconDetails.notification_id == undefined) &&
    !enableTooltip
  )
    return icon;

  switch (iconDetails.flag) {
    case 0:
      switch (iconDetails.notification_id) {
        case 10:
          icon = <HeightIcon sx={defaultStyling} />;
          break;
        case 9:
          icon = <CycloneIcon sx={defaultStyling} />;
          break;
        case 11:
          icon = <HeightIcon sx={defaultStyling} />;
          break;
        case 13:
          icon = <CrisisAlertIcon sx={defaultStyling} />;
          break;
        case 12:
          icon = <TerrainIcon sx={defaultStyling} />;
          break;
        case 75:
          icon = <HeightIcon sx={defaultStyling} />;
          break;
        case 76:
          icon = <HeightIcon sx={defaultStyling} />;
          break;
      }
      break;
    case 1:
      switch (iconDetails.notification_id) {
        case 6:
          icon = <NotificationImportantIcon sx={defaultStyling} />;
          break;
        case 7:
          icon = <SpeedIcon sx={defaultStyling} />;
          break;
        case 1:
          icon = <BatteryAlertRounded sx={defaultStyling} />;
          break;
      }
      break;
    case 2:
      switch (iconDetails.notification_id) {
        case 5:
          icon = <EventBusyIcon sx={defaultStyling} />;
          break;
        case 8:
          icon = <EventBusyIcon sx={defaultStyling} />;
          break;
      }
      break;
    case 3:
      switch (iconDetails.notification_id) {
        case 3:
          icon = <HourglassDisabledIcon sx={defaultStyling} />;
          break;
        case 2:
          icon = <QueryStatsIcon sx={defaultStyling} />;
          break;
        case 42:
          icon = <CloudOffIcon sx={defaultStyling} />;
          break;
        case 4:
          icon = <DangerousIcon sx={defaultStyling} />;
          break;
        case 108:
          icon = <RunningWithErrorsIcon sx={defaultStyling} />;
          break;
      }
      break;
  }

  if (!enableTooltip) return <Avatar sx={statusStyling(iconDetails.color)}>{icon}</Avatar>;
  else
    return (
      <Avatar sx={statusStyling(iconDetails.color)}>
        <Tooltip arrow title={iconDetails.opgave} enterTouchDelay={0}>
          {icon}
        </Tooltip>
      </Avatar>
    );
};

export default NotificationIcon;
