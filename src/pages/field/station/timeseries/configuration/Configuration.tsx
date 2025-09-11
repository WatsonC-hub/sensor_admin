import {Box, Typography} from '@mui/material';
import React from 'react';

import UnitMeasurementConfig from './UnitMeasurementConfig';
import YearlyControlsConfig from './YearlyControlsConfig';

const Configuration = () => {
  return (
    <>
      <Layout>
        <Typography variant="h6" gutterBottom>
          Måle- og sendeforhold
        </Typography>
        <UnitMeasurementConfig />
      </Layout>
      <Layout>
        <Typography variant="h6" gutterBottom>
          Kontrol interval
        </Typography>
        <YearlyControlsConfig />
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
      }}
    >
      {children}
    </Box>
  );
};
