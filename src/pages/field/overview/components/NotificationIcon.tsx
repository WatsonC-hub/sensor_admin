import {Box, BoxProps, Tooltip} from '@mui/material';
import React from 'react';
import {IconDetails} from '~/features/notifications/types';
import {getColor, getIcon} from '~/features/notifications/utils';
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

type IconDetailsWithTooltip = IconDetails & {
  tooltip: string;
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
  const icon = getIcon(iconDetails, false);

  if (
    (iconDetails.notification_id === 0 ||
      iconDetails.flag === -1 ||
      iconDetails.notification_id == undefined) &&
    enableTooltip
  )
    return (
      <CircleBox sx={flagStyling(iconDetails)}>
        <Tooltip arrow title={(iconDetails as IconDetailsWithTooltip).tooltip} enterTouchDelay={0}>
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

  if (!enableTooltip) return <CircleBox sx={flagStyling(iconDetails)}>{icon}</CircleBox>;
  else
    return (
      <CircleBox sx={flagStyling(iconDetails)}>
        <Tooltip arrow title={(iconDetails as IconDetailsWithTooltip).tooltip} enterTouchDelay={0}>
          {icon}
        </Tooltip>
      </CircleBox>
    );
};

export default NotificationIcon;
