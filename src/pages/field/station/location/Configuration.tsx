import {Box, Typography} from '@mui/material';
import React from 'react';
import SLAConfiguration from './SLAConfiguration';

const Configuration = () => {
  return (
    <>
      <Layout>
        <Box width="fit-content" alignItems="center">
          <Typography variant="h6">Service Level Agreement (SLA)</Typography>
        </Box>

        <SLAConfiguration />
      </Layout>
    </>
  );
};

export default Configuration;

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = ({children}: LayoutProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        minWidth: 500,
      }}
    >
      {children}
    </Box>
  );
};
