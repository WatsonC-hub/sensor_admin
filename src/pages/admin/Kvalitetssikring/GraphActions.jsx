import React from 'react';
import {Box, Button, Tooltip} from '@mui/material';
import {useAtom} from 'jotai';
import {qaSelection} from 'src/state/atoms';
import BackspaceIcon from '@mui/icons-material/Backspace';
import DensityLargeIcon from '@mui/icons-material/DensityLarge';

const GraphActions = () => {
  const [selectedData, setSelectedData] = useAtom(qaSelection);

  const isDisabled = selectedData.length === 0;
  return (
    <Box
      bgcolor="secondary.main" // Use your secondary background color
      borderRadius={4} // Adjust the radius as needed
      border={2}
      borderColor={'primary.main'}
      padding={2} // Add padding to the toolbar
      display="flex-wrap"
      justifyContent="center"
      alignItems="center"
      // gap={8}
      // width={'80%'}
      alignSelf={'center'}
    >
      <Tooltip
        title={isDisabled ? 'ℹ️ Vælg punkter med værktøj først' : ''}
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: 'info.main',
              color: 'white',
            },
          },
        }}
      >
        <span>
          <Button
            startIcon={<BackspaceIcon />}
            color="primary"
            onClick={() => console.log(selectedData)}
            disabled={isDisabled}
          >
            Fjern punkter
          </Button>
          <Button color="primary" disabled={isDisabled} startIcon={<DensityLargeIcon />}>
            Valid y-range
          </Button>
        </span>
      </Tooltip>
      {/* <Button color="primary">Spikes</Button> */}
    </Box>
  );
};

export default GraphActions;
