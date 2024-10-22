import {ManageSearch} from '@mui/icons-material';
import {SpeedDial, SpeedDialAction} from '@mui/material';
import React from 'react';

import {DialAction} from '~/types';

type SpeedDialWrapperProps = {
  actions: Array<DialAction>;
};

const SpeedDialWrapper = ({actions}: SpeedDialWrapperProps) => {
  return (
    <div>
      <SpeedDial
        ariaLabel="SpeedDial"
        icon={<ManageSearch />}
        sx={{
          position: 'fixed',
          bottom: 65,
          right: 20,
          borderRadius: 4.5,

          color: 'white',
        }}
      >
        {actions.map((action) => {
          return (
            <SpeedDialAction
              key={action.key}
              icon={action.icon}
              tooltipOpen
              onClick={action.onClick}
              tooltipTitle={action.tooltip}
              sx={{
                '.MuiSpeedDialAction-fab': {
                  borderRadius: 4,
                  backgroundColor: 'primary.main',
                  // color: 'white',
                  color: action.color,
                },
                '.MuiSpeedDialAction-staticTooltipLabel': {
                  borderRadius: 4,

                  // backgroundColor: 'primary.main',
                  // color: 'white',
                },
              }}
            />
          );
        })}
      </SpeedDial>
    </div>
  );
};

export default SpeedDialWrapper;
