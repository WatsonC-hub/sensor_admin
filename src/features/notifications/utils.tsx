// import {BatteryAlertRounded, Circle} from '@mui/icons-material';
// import CloudOffIcon from '@mui/icons-material/CloudOff';
// import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
// import CycloneIcon from '@mui/icons-material/Cyclone';
// import DangerousIcon from '@mui/icons-material/Dangerous';
// import EventBusyIcon from '@mui/icons-material/EventBusy';
// import HeightIcon from '@mui/icons-material/Height';
// import HourglassDisabledIcon from '@mui/icons-material/HourglassDisabled';
// import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
// import QueryStatsIcon from '@mui/icons-material/QueryStats';
// import RunningWithErrorsIcon from '@mui/icons-material/RunningWithErrors';
// import SpeedIcon from '@mui/icons-material/Speed';
// import TerrainIcon from '@mui/icons-material/Terrain';
// import {CircleBox} from '~/pages/field/overview/components/NotificationIcon';
import {NotificationIDEnum, sensorColors, sensorLocationTypeColors} from './consts';
// import {BoxProps} from '@mui/material/Box';
import {IconDetails} from './types';
// import BatteryIcon from '~/features/notifications/icons/low_battery.svg?react';
// import BatteryIconRaw from '~/features/notifications/icons/low_battery.svg?raw';

import {JSX} from 'react';

const rawIcons = Object.fromEntries(
  Object.entries(
    import.meta.glob('./icons/*.svg', {
      eager: true,
      query: '?raw',
      import: 'default',
    })
  ).map(([key, value]) => [key.split('_').pop()?.split('.')[0], value])
) as Record<NotificationIDEnum, string>;

const reactIcons = Object.fromEntries(
  Object.entries(
    import.meta.glob('./icons/*.svg', {
      eager: true,
      query: '?react',
      import: 'default',
    })
  ).map(([key, value]) => [key.split('_').pop()?.split('.')[0], value])
) as Record<NotificationIDEnum, React.FunctionComponent<React.SVGProps<SVGSVGElement>>>;

console.log(rawIcons);

const defaultStyling = {
  textAlign: 'start',
  fontSize: 'inherit',
  margin: '2px',
  // p: 1,
  // width: 36,
  // height: 36,
} as const;

export const getColor = (iconDetails: IconDetails) => {
  if (
    iconDetails?.active === null &&
    iconDetails?.loctype_id !== 12 &&
    iconDetails?.calculated !== true
  )
    return sensorLocationTypeColors['-1'].color; // Nyopsætning
  if (iconDetails?.loctype_id === 12) return sensorLocationTypeColors[iconDetails.loctype_id].color; // Enkeltmålinger
  if (iconDetails?.notify_type === 'station') return '#4caf50';
  if (iconDetails?.status == 'POSTPONED') return '#4caf50';
  if (iconDetails?.notification_id == 12) return '#334FFF';
  if (iconDetails?.active === false) return '#C0C0C0';
  // if (iconDetails?.flag !== undefined) return sensorColors[iconDetails?.flag].color;
  if (iconDetails?.color) return iconDetails?.color;
  if (iconDetails?.flag !== undefined) return sensorColors[iconDetails?.flag].color;
  return '#4caf50';
};

function getIcon<B extends boolean>(
  iconDetails: IconDetails,
  raw: B
): B extends true ? string : JSX.Element;
function getIcon(iconDetails: IconDetails, raw: boolean): string | JSX.Element {
  if (raw == true) {
    if (iconDetails.notification_id && iconDetails.notification_id in rawIcons) {
      return rawIcons[iconDetails.notification_id];
    }

    return '';
  } else {
    if (iconDetails.notification_id && iconDetails.notification_id in reactIcons) {
      const Component = reactIcons[iconDetails.notification_id];
      return <Component style={defaultStyling} viewBox="0 0 24 24" />;
    }
    return <></>;
  }
}
export {getIcon};
