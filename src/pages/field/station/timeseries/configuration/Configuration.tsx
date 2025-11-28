import {Box, Typography} from '@mui/material';
import React from 'react';

import UnitMeasurementConfig from './UnitMeasurementConfig';
import YearlyControlsConfig from './YearlyControlsConfig';
import Synchronization from './Synchronization';
import TooltipWrapper from '~/components/TooltipWrapper';

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
        <Box width="fit-content" alignItems="center">
          <TooltipWrapper
            color="info"
            description="Kontrolhyppighed definerer hvor ofte der skal foretages kontrolmålinger. Forvarslingstiden angiver hvor lang tid i forvejen, der skal vises en opgave om at en kontrolmåling skal udføres"
          >
            <Typography variant="h6">Kontrolforhold</Typography>
          </TooltipWrapper>
        </Box>
        <YearlyControlsConfig />
      </Layout>
      <Layout>
        {/* <Typography variant="h6" gutterBottom>
            Synkronisering
          </Typography> */}
        <Synchronization />
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
