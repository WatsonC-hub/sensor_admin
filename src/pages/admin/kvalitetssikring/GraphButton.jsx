import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {Box, Tooltip} from '@mui/material';
import React from 'react';

import Button from '~/components/Button';

const GraphButton = ({onClick, icon, disabled, children, infotext, enableTooltip, bttype}) => {
  const showTooltip = enableTooltip === undefined ? !disabled : enableTooltip;
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Button
        startIcon={icon}
        bttype={bttype}
        variant="contained"
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </Button>
      <Tooltip
        title={showTooltip ? 'ℹ️ ' + infotext : ''}
        enterTouchDelay={0}
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: 'info.main',
              color: 'white',
            },
          },
        }}
      >
        <InfoOutlinedIcon
          fontSize="medium"
          sx={{
            color: disabled ? 'rgba(0, 0, 0, 0.12)' : 'info.main',
          }}
        />
      </Tooltip>
    </Box>
  );
};

export default GraphButton;
