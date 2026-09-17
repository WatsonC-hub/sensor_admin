import {ManageSearch} from '@mui/icons-material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {Box, SpeedDial, SpeedDialAction, Tooltip, Typography} from '@mui/material';
import React, {useState} from 'react';
import {toast} from 'react-toastify';

import useBreakpoints from '~/hooks/useBreakpoints';

import type {DialAction} from '~/types';

type CustomSpeedDialProps = {
  actions: Array<DialAction>;
};

const CustomSpeedDial = ({actions}: CustomSpeedDialProps) => {
  const {isMobile, isMonitor, isLargeLaptop} = useBreakpoints();
  const [open, setOpen] = useState<boolean>(isMonitor || isLargeLaptop);
  return (
    <SpeedDial
      ariaLabel="SpeedDial"
      icon={
        <Box
          sx={{
            display: 'flex',
            px: 3,
            flexDirection: 'row',
          }}
        >
          <ManageSearch />
          {!isMobile && (
            <Typography
              sx={{
                px: 1,
                textTransform: 'none',
              }}
            >
              Justér
            </Typography>
          )}
        </Box>
      }
      open={open}
      sx={{
        position: 'sticky',
        bottom: 10,
        right: 20,
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
          width: 'fit-content',
          borderRadius: 4.5,
          backgroundColor: 'secondary.main',
          ':hover': {
            backgroundColor: 'secondary.dark',
          },
        },
      }}
    >
      {actions.map((action) => {
        return (
          <SpeedDialAction
            key={action.key}
            icon={action.icon}
            slotProps={{
              fab: {
                sx: {
                  color: 'white',
                  backgroundColor: 'primary.main',
                  borderRadius: 4,
                  ':hover': {
                    backgroundColor: 'secondary.main',
                  },
                },
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
              },
              tooltip: {
                title: action.tooltip,
                open: true,
              },
              staticTooltipLabel: {
                sx: {
                  borderRadius: 2.5,
                },
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
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          gap: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <InfoOutlinedIcon color="info" />
        <Typography>{toastContent}</Typography>
      </Box>
    </Tooltip>
  );
};

export default CustomSpeedDial;
