import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {Box, Button, Tooltip} from '@mui/material';
import React from 'react';

const GraphButton = ({onClick, icon, disabled, children, infotext, enableTooltip}) => {
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
        color="primary"
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
