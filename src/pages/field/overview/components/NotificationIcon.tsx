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
import {Box, BoxProps, Tooltip} from '@mui/material';
import React from 'react';

import {sensorColors, sensorLocationTypeColors} from '~/consts';
//Imports

export const statusStyling = (flagColor: string) => {
  return {
    bgcolor: flagColor,
    textAlign: 'center',
    // width: 36,
    // height: 36,
  };
};

const flagStyling = (iconDetails: IconDetails) => {
  return {
    bgcolor: getColor(iconDetails),
    textAlign: 'center',
    // width: 36,
    // height: 36,
  };
};

export const CircleBox = ({
  children,
  sx,
  padding = '0.0em',
}: {
  children: React.ReactNode;
  sx?: Omit<BoxProps['sx'], 'textAlign' | 'fontSize'>;
  padding?: string;
}) => {
  return (
    <Box
      sx={{
        ...defaultStyling,
        ...sx,
        borderRadius: '9999px',
        color: 'white',
        display: 'flex',
        width: '1.5em',
        height: '1.5em',
        alignSelf: 'center',
        // width: ref.current ? ref.current.clientHeight : undefined,
        // height: ref.current ? ref.current.clientHeight : undefined,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // width: '100%',
          // height: '100%',
          aspectRatio: '1/1',
          p: padding,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

const defaultStyling: BoxProps['sx'] = {
  textAlign: 'start',
  fontSize: 'inherit',
  // p: 1,
  // width: 36,
  // height: 36,
};

type IconDetails = {
  color?: string | null;
  notification_id?: number;
  flag?: number;
  loctype_id?: number | string;
  calculated?: boolean | null;
  opgave?: string | null;
  active?: boolean | null;
  status?: 'SCHEDULED' | 'POSTPONED' | 'IGNORED' | null;
  notify_type?: 'obs' | 'station' | 'primary' | null;
  isqa?: boolean;
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

const NotificationIcon = ({iconDetails, enableTooltip = false}: NotificationIconProps) => {
  let icon;
  if (iconDetails.notify_type === 'obs') {
    icon = (
      <CircleBox
        sx={{
          ...defaultStyling,
          color: getColor(iconDetails),
        }}
        padding="0em"
      >
        <Circle
          sx={{
            textAlign: 'start',
            fontSize: '1.3em',
            color: '#4caf50',
          }}
        />
      </CircleBox>
    );
  } else {
    icon = (
      <Circle
        sx={{
          ...defaultStyling,
          color: getColor(iconDetails),
        }}
      />
    );
  }

  if (
    (iconDetails.notification_id === 0 ||
      iconDetails.flag === -1 ||
      iconDetails.notification_id == undefined) &&
    enableTooltip
  )
    return (
      <CircleBox sx={flagStyling(iconDetails)}>
        <Tooltip arrow title={iconDetails.opgave} enterTouchDelay={0}>
          {icon}
        </Tooltip>
      </CircleBox>
    );
  else if (
    (iconDetails.notification_id === 0 ||
      iconDetails.flag === -1 ||
      iconDetails.notification_id == undefined) &&
    !enableTooltip
  ) {
    return <CircleBox sx={flagStyling(iconDetails)}>{icon}</CircleBox>;
  }

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
        case 141:
          icon = <HeightIcon sx={defaultStyling} />;
          break;
        case 174:
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

  if (!enableTooltip) return <CircleBox sx={flagStyling(iconDetails)}>{icon}</CircleBox>;
  else
    return (
      <CircleBox sx={flagStyling(iconDetails)}>
        <Tooltip arrow title={iconDetails.opgave} enterTouchDelay={0}>
          {icon}
        </Tooltip>
      </CircleBox>
    );
};

export default NotificationIcon;
