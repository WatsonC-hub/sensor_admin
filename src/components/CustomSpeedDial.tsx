import {ManageSearch} from '@mui/icons-material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {Box, SpeedDial, SpeedDialAction, Tooltip, Typography} from '@mui/material';
import React, {useState} from 'react';
import {toast} from 'react-toastify';

import useBreakpoints from '~/hooks/useBreakpoints';
import {DialAction} from '~/types';

type CustomSpeedDialProps = {
  actions: Array<DialAction>;
};

const CustomSpeedDial = ({actions}: CustomSpeedDialProps) => {
  const {isTouch} = useBreakpoints();
  const {isMobile, isMonitor, isLargeLaptop} = useBreakpoints();
  const [open, setOpen] = useState<boolean>(isMonitor || isLargeLaptop);
  return (
    <SpeedDial
      ariaLabel="SpeedDial"
      icon={
        <Box display={'flex'} px={3} flexDirection={'row'}>
          <ManageSearch />
          {!isMobile && (
            <Typography px={1} textTransform={'none'}>
              Justér
            </Typography>
          )}
        </Box>
      }
      open={open}
      sx={{
        position: 'sticky',
        bottom: 10,
        ml: 'auto',
        alignItems: 'end',
        '.MuiSpeedDial-actions': {
          height: 0,
        },
      }}
      direction="up"
      FabProps={{
        onClick: () => {
          setOpen(!open);
        },
        sx: {
          width: isTouch ? 75 : 'fit-content',
          borderRadius: 4.5,
          backgroundColor: 'secondary.main',
          ':hover': {
            backgroundColor: 'secondary.main',
          },
        },
      }}
    >
      {actions.map((action) => {
        return (
          <SpeedDialAction
            key={action.key}
            icon={action.icon}
            tooltipOpen
            FabProps={{
              onClick: () => {
                action.onClick();
                setOpen(!open);
                if (toast.isActive('juster') && action.dialog === false)
                  toast.update('juster', {style: {display: 'none'}});

                if (toast.isActive('juster') && action.dialog !== false)
                  toast.update('juster', {
                    render: <CustomTooltip toastContent={action.toastTip} />,
                    type: 'default',
                  });
                else if (!toast.isActive('juster') && action.dialog !== false)
                  toast(<CustomTooltip toastContent={action.toastTip} />, {
                    autoClose: false,
                    toastId: 'juster',
                    style: {
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    },
                  });
              },
            }}
            tooltipTitle={action.tooltip}
            sx={{
              '.MuiSpeedDialAction-fab': {
                borderRadius: 4,
                backgroundColor: 'primary.main',
                color: action.color,
                ':hover': {
                  backgroundColor: 'secondary.main',
                },
              },
              '.MuiSpeedDialAction-staticTooltipLabel': {
                borderRadius: 2.5,
              },
            }}
          />
        );
      })}
    </SpeedDial>
  );
};

export const CustomTooltip = ({toastContent}: {toastContent: string}) => {
  return (
    <Tooltip
      title=""
      enterTouchDelay={0}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: 'primary.main',
          },
        },
        arrow: {
          sx: {
            color: 'primary.main',
          },
        },
      }}
      arrow={true}
    >
      <Box
        display={'flex'}
        flexDirection={'row'}
        width={'100%'}
        gap={1}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <InfoOutlinedIcon color="info" />
        <Typography>{toastContent}</Typography>
      </Box>
    </Tooltip>
  );
};

export default CustomSpeedDial;
