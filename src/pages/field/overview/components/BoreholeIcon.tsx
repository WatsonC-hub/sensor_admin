import {Box, BoxProps, Tooltip} from '@mui/material';
import React from 'react';
import {BoreholeDetails, IconDetails} from '~/features/notifications/types';
import {getBoreholeColor, getBoreholeIcon} from '~/features/notifications/utils';
//Imports

const flagStyling = (iconDetails: BoreholeDetails) => {
  return {
    bgcolor: getBoreholeColor(iconDetails),
    textAlign: 'center',
    // width: 36,
    // height: 36,
  };
};

const CircleBox = ({
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

type BoreholeIconProps =
  | {
      iconDetails: BoreholeDetails;
      enableTooltip?: true;
      noCircle?: boolean;
    }
  | {
      iconDetails: BoreholeDetails;
      enableTooltip?: false;
      noCircle?: boolean;
    };

const BoreholeIcon = ({
  iconDetails,
  enableTooltip = false,
  noCircle = false,
}: BoreholeIconProps) => {
  const icon = getBoreholeIcon(iconDetails, false);
  if (noCircle) {
    return <CircleBox sx={{textAlign: 'center'}}>{icon}</CircleBox>;
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

export default BoreholeIcon;
