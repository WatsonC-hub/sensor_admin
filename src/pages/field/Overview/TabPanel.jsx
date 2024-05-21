import Box from '@mui/material/Box';
import React from 'react';

export default function TabPanel(props) {
  const {children, value, index, ...other} = props;
  const ref = React.useRef({hasBeenMounted: false});
  ref.current.hasBeenMounted = ref.current.hasBeenMounted || value === index;
  return (
    <div
      style={{display: value === index ? null : 'none'}}
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
