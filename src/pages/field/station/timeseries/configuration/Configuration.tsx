import {Box, Typography} from '@mui/material';
import React from 'react';

import UnitMeasurementConfig from './UnitMeasurementConfig';
import YearlyControlsConfig from './YearlyControlsConfig';
import Synchronization from './Synchronization';
import TooltipWrapper from '~/components/TooltipWrapper';
import VisibilityConfig from './VisibilityConfig';
import {useAppContext} from '~/state/contexts';
import {useLocationData, useTimeseriesData} from '~/hooks/query/useMetadata';
import useDmpAllowedMapList from '~/features/station/api/useDmpAllowedMapList';
import {useUser} from '~/features/auth/useUser';

type ConfigurationProps = {
  ts_id: number;
};

const Configuration = ({ts_id}: ConfigurationProps) => {
  const {loc_id} = useAppContext(['loc_id']);
  const {superUser} = useUser();
  const {data: location_data} = useLocationData(loc_id);
  const {data: metadata} = useTimeseriesData(ts_id);
  const isJupiterType = [1, 11, 12, 16].includes(metadata?.tstype_id || 0);
  const isBorehole = location_data?.loctype_id === 9;
  const isDmpAllowed = useDmpAllowedMapList(ts_id);

  const disabled =
    (superUser && metadata?.is_customer_service) || (!superUser && !metadata?.is_customer_service);

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
      {(isDmpAllowed || (isJupiterType && isBorehole)) && (
        <Layout>
          <Typography variant="h6" gutterBottom>
            Synkronisering
          </Typography>
          <Synchronization
            canSyncJupiter={isJupiterType && isBorehole}
            isDmpAllowed={isDmpAllowed ?? false}
            disabled={disabled}
          />
        </Layout>
      )}
      <Layout>
        <Typography variant="h6" gutterBottom>
          Tilgængelighed
        </Typography>
        <VisibilityConfig ts_id={ts_id} />
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
