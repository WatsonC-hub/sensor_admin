import {Alert, Box, Typography} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {ErrorBoundary} from 'react-error-boundary';

import CustomBottomNavigation from '~/components/BottomNavigation';
import Button from '~/components/Button';
import NavBar from '~/components/NavBar';
import {metadataQueryOptions, useLocationData} from '~/hooks/query/useMetadata';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useStationPages} from '~/hooks/useQueryStateParameters';
import ErrorPage from '~/pages/field/station/ErrorPage';
import ImagePage from '~/pages/field/station/stamdata/ImagePage';
import {useAppContext} from '~/state/contexts';

import MinimalSelect from './MinimalSelect';
import StationDrawer from './StationDrawer';
import EditLocation from '~/pages/field/station/stamdata/EditLocation';
import Huskeliste from '~/features/stamdata/components/stationDetails/ressourcer/Huskeliste';
import {useUser} from '~/features/auth/useUser';
import LocationAccess from '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccess';
import ContactInfo from '~/features/stamdata/components/stationDetails/contacts/ContactInfo';

export default function LocationRouter() {
  const queryClient = useQueryClient();
  const {ts_id} = useAppContext(['loc_id'], ['ts_id']);
  const {createStamdata} = useNavigationFunctions();
  const [pageToShow] = useStationPages();
  const {data: metadata} = useLocationData();
  const user = useUser();
  if (metadata != undefined && metadata.timeseries.length > 0)
    metadata.timeseries.forEach((item) => {
      queryClient.prefetchQuery(metadataQueryOptions(item.ts_id));
    });

  return (
    <Layout>
      {metadata != undefined && metadata.timeseries.length === 0 && pageToShow === 'pejling' && (
        <Box
          display={'flex'}
          alignSelf={'center'}
          flexDirection={'column'}
          marginX={'auto'}
          maxWidth={400}
          gap={2}
          marginY={4}
        >
          <Alert
            severity={'info'}
            sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
          >
            <Typography>
              Der er ingen tidsserie og/eller udstyr tilknyttet denne lokation. Tryk på knappen
              nedenfor for at påbegynde oprettelse af tidsserie og/eller tilknytning af udstyr
            </Typography>
          </Alert>
          <Button
            bttype="primary"
            onClick={() => {
              createStamdata(ts_id ? '2' : '1', {
                state: {
                  ...metadata,
                },
              });
            }}
          >
            Opret tidsserie og/eller udstyr
          </Button>
        </Box>
      )}
      {pageToShow === 'billeder' && <ImagePage />}
      {pageToShow === 'generelt lokation' && <EditLocation />}
      {pageToShow === 'kontakter' && <ContactInfo />}
      {pageToShow === 'huskeliste' && user?.ressourcePermission && <Huskeliste />}
      {pageToShow === 'nøgler' && <LocationAccess />}
    </Layout>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({children}: LayoutProps) => {
  const {data: metadata} = useLocationData();
  const [pageToShow, setPageToShow] = useStationPages();
  const handleChange = (event: any, newValue: any) => {
    setPageToShow(newValue);
  };

  return (
    <>
      <CssBaseline />
      <NavBar>
        <NavBar.GoBack />
        <Box display="block" flexGrow={1} overflow="hidden">
          <Typography pl={1.7} textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
            {metadata?.loc_name}
          </Typography>
          <MinimalSelect />
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" flexShrink={0}>
          <NavBar.Home />
          <NavBar.Menu highligtFirst={false} />
        </Box>
      </NavBar>

      <main style={{flexGrow: 1}}>
        <StationDrawer />
        <ErrorBoundary FallbackComponent={(props) => <ErrorPage {...props} />}>
          {children}
          <CustomBottomNavigation pageToShow={pageToShow} onChange={handleChange} items={[]} />
        </ErrorBoundary>
      </main>
    </>
  );
};
