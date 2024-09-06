import Box from '@mui/material/Box';
import React, {ReactNode} from 'react';

interface TabPanelProps {
  children: ReactNode;
  value: string;
  index: string;
}

export default function TabPanel({children, value, index, ...other}: TabPanelProps) {
  const ref = React.useRef({hasBeenMounted: false});
  ref.current.hasBeenMounted = ref.current.hasBeenMounted || value === index;
  return (
    <div
      style={{display: value === index ? 'unset' : 'none'}}
      role="tabpanel"
      // hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {ref.current.hasBeenMounted ? <Box p={0.5}>{children}</Box> : null}
      {/* {children} */}
    </div>
  );
}
