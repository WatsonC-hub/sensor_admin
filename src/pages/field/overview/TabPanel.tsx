import Box from '@mui/material/Box';
import React, {ReactNode} from 'react';

interface TabPanelProps {
  children: ReactNode;
  value: string | null;
  index: string;
}

export default function TabPanel({children, value, index, ...other}: TabPanelProps) {
  return (
    <div
      style={{display: value === index ? 'unset' : 'none'}}
      role="tabpanel"
      // hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index ? <Box p={0.5}>{children}</Box> : null}
    </div>
  );
}
