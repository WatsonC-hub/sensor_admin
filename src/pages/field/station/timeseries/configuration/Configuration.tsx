import {Box, Typography} from '@mui/material';
import React from 'react';

import UnitMeasurementConfig from './UnitMeasurementConfig';
import YearlyControlsConfig from './YearlyControlsConfig';
import TooltipWrapper from '~/components/TooltipWrapper';
import RequiredServiceConfig from './RequiredServiceConfig';

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
        <Box width="fit-content" alignItems="center">
          <TooltipWrapper
            color="info"
            description="Denne konfiguration bruges til at angive om tidsserien skal driftes. Slår man denne fra, vil det være fordi tidsserien skal anvendes til enkeltmålinger eller pejleboringer"
          >
            <Typography variant="h6">Driftforhold</Typography>
          </TooltipWrapper>
        </Box>
        <RequiredServiceConfig />
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
