import moment from 'moment';
import {FlagEnum, NotificationIDEnum, sensorColors, sensorLocationTypeColors} from './consts';
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
) as Record<NotificationIDEnum | 'task' | 'trip', string>;

export const reactIcons = Object.fromEntries(
  Object.entries(
    import.meta.glob('./icons/*.svg', {
      eager: true,
      query: '?react',
      import: 'default',
    })
  ).map(([key, value]) => [key.split('/').pop()?.split('_')[0], value])
) as Record<
  NotificationIDEnum | 'task' | 'trip',
  React.FunctionComponent<React.SVGProps<SVGSVGElement>>
>;

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
    // !iconDetails?.itinerary_id &&
    iconDetails?.has_task &&
    iconDetails?.due_date
  ) {
    if (moment(iconDetails.due_date).isBefore(moment().toDate()))
      return sensorColors[FlagEnum.WARNING].color;
    return '#4caf50';
  } // Overdue}
  if (iconDetails?.no_unit == true && iconDetails?.loctype_id !== 12)
    return sensorLocationTypeColors['-1'].color; // Nyopsætning
  if (iconDetails?.loctype_id === 12) return sensorLocationTypeColors[iconDetails.loctype_id].color; // Enkeltmålinger
  // if (iconDetails?.notify_type === 'station') return '#4caf50';
  // if (iconDetails?.status == 'POSTPONED') return '#4caf50';
  // if (iconDetails?.notification_id == 12) return '#334FFF';
  if (iconDetails?.inactive == true) return '#C0C0C0';
  // if (iconDetails?.flag !== undefined) return sensorColors[iconDetails?.flag].color;
  // if (iconDetails?.type === 'itinerary') return '#4caf50';
  // if (
  //   // !iconDetails?.itinerary_id &&
  //   // iconDetails?.has_task &&
  //   iconDetails?.due_date &&
  //   iconDetails?.has_task &&
  //   moment(iconDetails.due_date).isBetween(
  //     moment().startOf('isoWeek'),
  //     moment(moment().startOf('isoWeek')).add(1, 'week')
  //   )
  // )
  //   return sensorColors[FlagEnum.WARNING].color; // Due this week
  if (iconDetails?.flag) return sensorColors[iconDetails?.flag].color;

  if (iconDetails?.color) return iconDetails.color;
  return '#4caf50';
};

function getIcon<B extends boolean = false>(
  iconDetails: IconDetails,
  raw: B
): B extends true ? string : JSX.Element;
function getIcon(iconDetails: IconDetails, raw: boolean): string | JSX.Element {
  if (raw == true) {
    if (iconDetails.flag == null && typeof iconDetails.itinerary_id == 'string') {
      return rawIcons['trip'];
    }

    if (iconDetails.notification_id && iconDetails.notification_id in rawIcons) {
      return rawIcons[iconDetails.notification_id];
    }

    if (iconDetails.has_task && iconDetails.flag == null && iconDetails.itinerary_id == null) {
      return rawIcons['task'];
    }

    return '';
  } else {
    if (
      iconDetails.has_task &&
      iconDetails.flag == null &&
      typeof iconDetails.itinerary_id == 'string'
    ) {
      const Component = reactIcons['trip'];
      return <Component style={defaultStyling} viewBox="0 0 24 24" />;
    }

    if (iconDetails.notification_id && iconDetails.notification_id in reactIcons) {
      const Component = reactIcons[iconDetails.notification_id];
      return <Component style={defaultStyling} viewBox="0 0 24 24" />;
    }

    if (iconDetails.has_task && iconDetails.flag == null && iconDetails.itinerary_id == null) {
      const Component = reactIcons['task'];
      return <Component style={defaultStyling} viewBox="0 0 24 24" />;
    }

    return <></>;
  }
}
export {getIcon};
