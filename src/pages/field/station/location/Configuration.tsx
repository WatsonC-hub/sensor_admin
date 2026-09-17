import {Box, Typography} from '@mui/material';
import React from 'react';
import SLAConfiguration from './SLAConfiguration';

const Configuration = () => {
  return (
    <>
      <Layout>
        <Typography variant="h6">Service Level Agreement (SLA)</Typography>

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
        maxWidth: 700,
      }}
    >
      {children}
    </Box>
  );
};
