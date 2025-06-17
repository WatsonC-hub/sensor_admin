import {Alert, Box, IconButton, Tooltip, Typography} from '@mui/material';
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
import Huskeliste from '~/features/stamdata/components/stationDetails/ressourcer/Huskeliste';
import {useUser} from '~/features/auth/useUser';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LocationAccess from '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccess';
import ContactInfo from '~/features/stamdata/components/stationDetails/contacts/ContactInfo';
import StationPageBoxLayout from './StationPageBoxLayout';
import ActionArea from './ActionArea';
import useBreakpoints from '~/hooks/useBreakpoints';
import {stationPages} from '~/helpers/EnumHelper';
import EditLocation from '~/pages/field/station/stamdata/EditLocation';

import {Fullscreen, FullscreenExit} from '@mui/icons-material';
import {useAtom} from 'jotai';
import {fullScreenAtom} from '~/state/atoms';
import {useDisplayState} from '~/hooks/ui';

export default function LocationRouter() {
  const queryClient = useQueryClient();
  useAppContext(['loc_id']);
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
                  Der er ingen tidsserie oprettet på denne lokation. Tryk på knappen nedenfor for at
                  påbegynde oprettelse af tidsserie
                </Typography>
              </Alert>
              <Button
                bttype="primary"
                onClick={() => {
                  createStamdata({
                    state: {
                      ...metadata,
                      initial_project_no: metadata?.projectno,
                    },
                  });
                }}
              >
                Opret tidsserie og/eller udstyr
              </Button>
            </StationPageBoxLayout>
          </Box>
        )}
      {pageToShow === stationPages.BILLEDER && (
        <StationPageBoxLayout>
          <ImagePage />
        </StationPageBoxLayout>
      )}
      {pageToShow === stationPages.GENERELTLOKATION && (
        <StationPageBoxLayout>
          <EditLocation />
        </StationPageBoxLayout>
      )}
      {pageToShow === stationPages.KONTAKTER && user?.features.contacts && (
        <StationPageBoxLayout>
          <ContactInfo />
        </StationPageBoxLayout>
      )}
      {pageToShow === stationPages.HUSKELISTE && user?.features.resources && (
        <StationPageBoxLayout>
          <Huskeliste />
        </StationPageBoxLayout>
      )}
      {pageToShow === stationPages.NØGLER && user?.features.keys && (
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
  const setLocId = useDisplayState((state) => state.setLocId);
  const [pageToShow, setPageToShow] = useStationPages();
  const [fullscreen, setFullscreen] = useAtom(fullScreenAtom);

  return (
    <>
      <CssBaseline />
      <NavBar>
        {isMobile ? <NavBar.StationDrawerMenu /> : <NavBar.GoBack />}
        <Box display="block" flexGrow={1} overflow="hidden">
          {!isMobile && (
            <Typography pl={1.7} textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
              {metadata?.loc_name}
            </Typography>
          )}
          {isMobile && <MinimalSelect />}
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" flexShrink={0}>
          {metadata?.projectno && (
            <Tooltip title="Vis projektside" arrow>
              <IconButton
                size="large"
                href={`https://www.watsonc.dk/calypso/projekt/?project=${metadata?.projectno}`}
                target="_blank"
                rel="noopener"
                color="inherit"
              >
                <OpenInNewIcon sx={{px: 0}} />
              </IconButton>
            </Tooltip>
          )}
          {!isMobile && (
            <IconButton
              onClick={() => {
                setFullscreen((prev) => !prev);
              }}
              color="inherit"
              size="large"
            >
              {fullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          )}
          <NavBar.Close
            onClick={() => {
              if (pageToShow) setPageToShow(null);
              setLocId(null);
            }}
          />
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
