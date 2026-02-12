import {Box, Typography} from '@mui/material';
import React from 'react';

import UnitMeasurementConfig from './UnitMeasurementConfig';
import YearlyControlsConfig from './YearlyControlsConfig';
import Synchronization from './Synchronization';
import TooltipWrapper from '~/components/TooltipWrapper';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import useDMPAllowed from '~/features/station/api/useDmpAllowedMapList';
import VisibilityConfig from './VisibilityConfig';

type ConfigurationProps = {
  loc_id: number;
  ts_id: number;
};

const Configuration = ({loc_id, ts_id}: ConfigurationProps) => {
  const {data: metadata} = useTimeseriesData(ts_id);
  const isJupiterType = [1, 11, 12, 16].includes(metadata?.tstype_id || 0);
  const isBorehole = metadata?.loctype_id === 9;

  const isDmpAllowed = useDMPAllowed(ts_id);

  const canSyncJupiter = isBorehole && isJupiterType;
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
      {(isDmpAllowed || canSyncJupiter) && (
        <Layout>
          <Synchronization />
        </Layout>
      )}
      <Layout>
        <Typography variant="h6" gutterBottom>
          Tilgængelighed
        </Typography>
        <VisibilityConfig loc_id={loc_id} ts_id={ts_id} disabled={disabled} />
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
