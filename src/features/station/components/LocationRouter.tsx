import {Alert, Box, Typography} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import {useQueryClient} from '@tanstack/react-query';
import React from 'react';

import Button from '~/components/Button';
import NavBar from '~/components/NavBar';
import {metadataQueryOptions, useLocationData} from '~/hooks/query/useMetadata';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useStationPages} from '~/hooks/useQueryStateParameters';
import ImagePage from '~/pages/field/station/stamdata/ImagePage';
import {useAppContext} from '~/state/contexts';

import MinimalSelect from './MinimalSelect';
import StationDrawer from './StationDrawer';
import EditLocation from '~/pages/field/station/stamdata/EditLocation';
import Huskeliste from '~/features/stamdata/components/stationDetails/ressourcer/Huskeliste';
import {useUser} from '~/features/auth/useUser';
import LocationAccess from '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccess';
import ContactInfo from '~/features/stamdata/components/stationDetails/contacts/ContactInfo';
import StationPageBoxLayout from './StationPageBoxLayout';
import ActionArea from './ActionArea';
import useBreakpoints from '~/hooks/useBreakpoints';
import {stationPages} from '~/helpers/EnumHelper';

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
      {metadata != undefined &&
        metadata.timeseries.length === 0 &&
        pageToShow === stationPages.PEJLING && (
          <Box maxWidth={400} mx={'auto'}>
            <StationPageBoxLayout>
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
            </StationPageBoxLayout>
          </Box>
        )}
      {pageToShow === stationPages.BILLEDER && <ImagePage />}
      {pageToShow === stationPages.GENERELTLOKATION && (
        <StationPageBoxLayout>
          <EditLocation />
        </StationPageBoxLayout>
      )}
      {pageToShow === stationPages.KONTAKTER && user?.contactAndKeysPermission && (
        <StationPageBoxLayout>
          <ContactInfo />
        </StationPageBoxLayout>
      )}
      {pageToShow === stationPages.HUSKELISTE && user?.ressourcePermission && (
        <StationPageBoxLayout>
          <Huskeliste />
        </StationPageBoxLayout>
      )}
      {pageToShow === stationPages.NØGLER && user?.contactAndKeysPermission && (
        <StationPageBoxLayout>
          <LocationAccess />
        </StationPageBoxLayout>
      )}
    </Layout>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({children}: LayoutProps) => {
  const {data: metadata} = useLocationData();
  const {isMobile} = useBreakpoints();

  return (
    <>
      <CssBaseline />
      <NavBar>
        {isMobile ? <NavBar.StationDrawerMenu /> : <NavBar.GoBack />}
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

      <Box component="main" sx={{flexGrow: 1, display: 'flex', flexDirection: 'row'}}>
        <StationDrawer />
        <Box display="flex" width={'100%'} flexGrow={1} gap={1} flexDirection={'column'}>
          {children}
          {isMobile && <ActionArea />}
        </Box>
      </Box>
    </>
  );
};
