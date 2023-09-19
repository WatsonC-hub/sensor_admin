import React from 'react';
import {Box, Button} from '@mui/material';
import {useAtom} from 'jotai';
import {qaSelection} from 'src/state/atoms';
import BackspaceIcon from '@mui/icons-material/Backspace';

const GraphActions = () => {
  const [selectedData, setSelectedData] = useAtom(qaSelection);
  return (
    <Box
      bgcolor="secondary.main" // Use your secondary background color
      borderRadius={4} // Adjust the radius as needed
      border={2}
      borderColor={'primary.main'}
      padding={2} // Add padding to the toolbar
      display="flex"
      justifyContent="center"
      alignItems="center"
      gap={8}
    >
      <Button
        startIcon={<BackspaceIcon />}
        color="primary"
        onClick={() => console.log(selectedData)}
      >
        Eksluder data
      </Button>
      <Button color="primary">Gem</Button>
      <Button color="primary">Gem</Button>
      <Button color="primary">Gem</Button>
    </Box>
  );
};

export default GraphActions;
