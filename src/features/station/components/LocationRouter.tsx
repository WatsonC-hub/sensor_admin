import {PhotoLibraryRounded, ConstructionRounded} from '@mui/icons-material';
import RuleIcon from '@mui/icons-material/Rule';
import {Alert, Box, Typography} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import {useQueryClient} from '@tanstack/react-query';
import {startCase} from 'lodash';
import React from 'react';
import {ErrorBoundary} from 'react-error-boundary';

import CustomBottomNavigation from '~/components/BottomNavigation';
import Button from '~/components/Button';
import NavBar from '~/components/NavBar';
import {navIconStyle} from '~/consts';
import {stationPages} from '~/helpers/EnumHelper';
import {metadataQueryOptions, useLocationData} from '~/hooks/query/useMetadata';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useStationPages} from '~/hooks/useQueryStateParameters';
import ErrorPage from '~/pages/field/station/ErrorPage';
import EditStamdata from '~/pages/field/station/stamdata/EditStamdata';
import ImagePage from '~/pages/field/station/stamdata/ImagePage';
import {useAppContext} from '~/state/contexts';

import MinimalSelect from './MinimalSelect';
import StationDrawer from './StationDrawer';

export default function LocationRouter() {
  const queryClient = useQueryClient();
  const {ts_id} = useAppContext(['loc_id'], ['ts_id']);
  const {createStamdata} = useNavigationFunctions();
  const [pageToShow] = useStationPages();
  const {data: metadata} = useLocationData();

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
      {pageToShow === 'stamdata' && <EditStamdata />}
      {pageToShow === 'billeder' && <ImagePage />}
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
  const navigationItems = [];
  navigationItems.push(
    {
      text: 'Tidsserie',
      value: stationPages.PEJLING,
      icon: <RuleIcon />,
      color: navIconStyle(pageToShow === stationPages.PEJLING),
    },
    {
      text: startCase(stationPages.BILLEDER),
      value: stationPages.BILLEDER,
      icon: <PhotoLibraryRounded />,
      color: navIconStyle(pageToShow === stationPages.BILLEDER),
    },
    {
      text: startCase(stationPages.STAMDATA),
      value: stationPages.STAMDATA,
      icon: <ConstructionRounded />,
      color: navIconStyle(pageToShow === stationPages.STAMDATA),
    }
  );
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
          <CustomBottomNavigation
            pageToShow={pageToShow}
            onChange={handleChange}
            items={navigationItems}
          />
        </ErrorBoundary>
      </main>
    </>
  );
};
