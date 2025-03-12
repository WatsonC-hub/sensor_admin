import {NotificationIDEnum, sensorColors, sensorLocationTypeColors} from './consts';
import {IconDetails} from './types';

import {JSX} from 'react';

const rawIcons = Object.fromEntries(
  Object.entries(
    import.meta.glob('./icons/*.svg', {
      eager: true,
      query: '?raw',
      import: 'default',
    })
  ).map(([key, value]) => [key.split('/').pop()?.split('_')[0], value])
) as Record<NotificationIDEnum, string>;

const reactIcons = Object.fromEntries(
  Object.entries(
    import.meta.glob('./icons/*.svg', {
      eager: true,
      query: '?react',
      import: 'default',
    })
  ).map(([key, value]) => [key.split('/').pop()?.split('_')[0], value])
) as Record<NotificationIDEnum, React.FunctionComponent<React.SVGProps<SVGSVGElement>>>;

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
  // if (iconDetails?.notification_id == 12) return '#334FFF';
  if (iconDetails?.active === false) return '#C0C0C0';
  // if (iconDetails?.flag !== undefined) return sensorColors[iconDetails?.flag].color;
  if (iconDetails?.flag !== undefined) return sensorColors[iconDetails?.flag].color;
  if (iconDetails?.color) return iconDetails?.color;
  return '#4caf50';
};

function getIcon<B extends boolean = false>(
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
