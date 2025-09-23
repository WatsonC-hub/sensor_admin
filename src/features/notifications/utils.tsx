import {
  boreholeColors,
  BoreHoleFlagEnum,
  FlagEnum,
  NotificationEnum,
  NotificationIDEnum,
  sensorColors,
} from './consts';
import {BoreholeDetails, IconDetails} from './types';

import {JSX} from 'react';
import dayjs from 'dayjs';

const rawIcons = Object.fromEntries(
  Object.entries(
    import.meta.glob('./icons/*.svg', {
      eager: true,
      query: '?raw',
      import: 'default',
    })
  ).map(([key, value]) => [key.split('/').pop()?.split('_')[0], value])
) as Record<NotificationIDEnum | 'task' | 'trip' | 'borehole', string>;

const reactIcons = Object.fromEntries(
  Object.entries(
    import.meta.glob('./icons/*.svg', {
      eager: true,
      query: '?react',
      import: 'default',
    })
  ).map(([key, value]) => [key.split('/').pop()?.split('_')[0], value])
) as Record<
  NotificationIDEnum | 'task' | 'trip' | 'borehole',
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
  if (iconDetails?.flag) return sensorColors[iconDetails?.flag].color;
  if (iconDetails?.has_task) {
    if (iconDetails.due_date?.add(1, 'day').isBefore(dayjs()))
      return sensorColors[FlagEnum.WARNING].color;
    else if (
      iconDetails.due_date?.isSameOrBefore(dayjs().add(1, 'month')) &&
      iconDetails.itinerary_id === null
    )
      return sensorColors[FlagEnum.INFO].color;
    return sensorColors[FlagEnum.OK].color;
  }
  if (iconDetails?.no_unit == true && iconDetails?.inactive == true)
    return sensorColors[NotificationEnum.NO_UNIT].color; // Nyopsætning

  if (iconDetails?.inactive == true) return sensorColors[NotificationEnum.INACTIVE].color; // Inaktiv

  if (iconDetails?.color) return iconDetails.color;
  return sensorColors[FlagEnum.OK].color;
};

export const getBoreholeColor = (BoreholeDetails: BoreholeDetails) => {
  if (BoreholeDetails?.status)
    return boreholeColors[Math.max(...BoreholeDetails.status) as BoreHoleFlagEnum].color;

  return boreholeColors[BoreHoleFlagEnum.OK].color;
};

function getBoreholeIcon<B extends boolean = false>(
  BoreholeDetails: BoreholeDetails,
  raw: B
): B extends true ? string : JSX.Element;
function getBoreholeIcon(boreholeDetails: BoreholeDetails, raw: boolean): string | JSX.Element {
  if (raw == true) {
    if (boreholeDetails.status && boreholeDetails.status.length > 0) {
      return rawIcons['borehole'];
    }
    return '';
  } else {
    if (boreholeDetails.status && boreholeDetails.status.length > 0) {
      const Component = reactIcons['borehole'];
      return <Component style={defaultStyling} viewBox="0 0 24 24" />;
    }
    return <></>;
  }
}

function getIcon<B extends boolean = false>(
  iconDetails: IconDetails,
  raw: B
): B extends true ? string : JSX.Element;
function getIcon(iconDetails: IconDetails, raw: boolean): string | JSX.Element {
  if (raw == true) {
    if (iconDetails.mapicontype === 'trip') {
      return rawIcons['trip'];
    }

    if (iconDetails.notification_id && iconDetails.notification_id in rawIcons) {
      return rawIcons[iconDetails.notification_id];
    }

    if (iconDetails.mapicontype === 'task') {
      return rawIcons['task'];
    }

    if (iconDetails.flag == null && typeof iconDetails.itinerary_id == 'string') {
      return rawIcons['trip'];
    }

    if (iconDetails.has_task && iconDetails.flag == null && iconDetails.itinerary_id == null) {
      return rawIcons['task'];
    }

    return '';
  } else {
    if (iconDetails.mapicontype === 'trip') {
      const Component = reactIcons['trip'];
      return <Component style={defaultStyling} viewBox="0 0 24 24" />;
    }

    if (iconDetails.notification_id && iconDetails.notification_id in reactIcons) {
      const Component = reactIcons[iconDetails.notification_id];
      return <Component style={defaultStyling} viewBox="0 0 24 24" />;
    }

    if (iconDetails.mapicontype === 'task') {
      const Component = reactIcons['task'];
      return <Component style={defaultStyling} viewBox="0 0 24 24" />;
    }

    if (iconDetails.flag == null && typeof iconDetails.itinerary_id == 'string') {
      const Component = reactIcons['trip'];
      return <Component style={defaultStyling} viewBox="0 0 24 24" />;
    }

    if (iconDetails.has_task && iconDetails.flag == null && iconDetails.itinerary_id == null) {
      const Component = reactIcons['task'];
      return <Component style={defaultStyling} viewBox="0 0 24 24" />;
    }

    return <></>;
  }
}
export {getIcon, getBoreholeIcon};
