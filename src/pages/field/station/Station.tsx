import {Box, Divider, IconButton, Tooltip, Typography} from '@mui/material';
import React, {ReactNode, useEffect} from 'react';

import NavBar from '~/components/NavBar';
import {useUser} from '~/features/auth/useUser';
import QAHistory from '~/features/kvalitetssikring/components/QaHistory';
import ReferenceForm from '~/features/stamdata/components/stamdata/ReferenceForm';
import ContactInfo from '~/features/stamdata/components/stationDetails/contacts/ContactInfo';
import LocationAccess from '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccess';
import Huskeliste from '~/features/stamdata/components/stationDetails/ressourcer/Huskeliste';
import ActionArea from '~/features/station/components/ActionArea';
import BatteryStatus from '~/features/station/components/BatteryStatus';
import MinimalSelect from '~/features/station/components/MinimalSelect';
import {useLocationData, useTimeseriesData} from '~/hooks/query/useMetadata';
import {useDisplayState} from '~/hooks/ui';
import {useShowFormState, useStationPages} from '~/hooks/useQueryStateParameters';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Algorithms from '~/pages/admin/kvalitetssikring/Algorithms';
import Pejling from '~/pages/field/station/pejling/Pejling';
import Tilsyn from '~/pages/field/station/tilsyn/Tilsyn';
import {useAppContext} from '~/state/contexts';
import EditUnit from './stamdata/EditUnit';
import ImagePage from './stamdata/ImagePage';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import useBreakpoints from '~/hooks/useBreakpoints';
import StationDrawer from '~/features/station/components/StationDrawer';
import {stationPages} from '~/helpers/EnumHelper';
import {useAtom} from 'jotai';
import {fullScreenAtom} from '~/state/atoms';
import {Fullscreen, FullscreenExit} from '@mui/icons-material';
import GraphManager from '~/features/station/components/GraphManager';
import EditLocation from './stamdata/EditLocation';
import EditTimeseries from './stamdata/EditTimeseries';
import Alarms from './alarms/Alarms';
import TimeseriesConfiguration from './timeseries/configuration/Configuration';
import LocationConfiguration from './location/Configuration';
import AppContextProvider from '~/helpers/AppContextProvider';

export default function Station() {
  const {ts_id, loc_id} = useAppContext(['loc_id', 'ts_id']);
  const {data: metadata} = useTimeseriesData();
  const [, setShowForm] = useShowFormState();
  const [pageToShow, setPageToShow] = useStationPages();
  const user = useUser();

  useEffect(() => {
    if (
      metadata?.calculated &&
      (pageToShow == 'tilsyn' ||
        pageToShow === 'gu' ||
        pageToShow === 'målepunkt' ||
        pageToShow === 'gt' ||
        pageToShow === 'justeringer')
    )
      setPageToShow('pejling');
    setShowForm(null);
  }, [ts_id, pageToShow]);

  {
    /* Makes sure that if the location we are accessing has boreholeno and intakeno, then it adds these to the context so that we later can access them */
  }
  return (
    <AppContextProvider
      values={{
        boreholeno: metadata?.boreholeno ?? undefined,
        intakeno: metadata?.intakeno ?? undefined,
      }}
    >
      <Layout>
        {pageToShow === stationPages.PEJLING && ts_id !== -1 && <Pejling key={ts_id} />}
        {pageToShow === stationPages.TILSYN && !metadata?.calculated && <Tilsyn key={ts_id} />}
        {pageToShow === stationPages.GENERELTUDSTYR && (
          <>
            <Box key={`graph-${ts_id}`}>
              <GraphManager />
            </Box>
            <Divider />
            <StationPageBoxLayout key={`unit-${ts_id}`}>
              <EditUnit />
            </StationPageBoxLayout>
          </>
        )}
        {pageToShow === stationPages.GENERELTLOKATION && (
          <StationPageBoxLayout key={`location-${loc_id}`}>
            <EditLocation />
          </StationPageBoxLayout>
        )}
        {pageToShow === stationPages.GENERELTIDSSERIE && (
          <StationPageBoxLayout key={`timeseries-${ts_id}`}>
            <EditTimeseries />
          </StationPageBoxLayout>
        )}
        {pageToShow === stationPages.TIDSSERIEKONFIGURATION && (
          <StationPageBoxLayout>
            <TimeseriesConfiguration />
          </StationPageBoxLayout>
        )}
        {pageToShow === stationPages.ALGORITHMS && user?.features.iotAccess && (
          <Algorithms key={`algorithms-${ts_id}`} />
        )}
        {pageToShow === stationPages.JUSTERINGER && user?.features.iotAccess && (
          <QAHistory key={`justeringer-${ts_id}`} />
        )}
        {pageToShow === stationPages.MAALEPUNKT &&
          metadata?.tstype_id === 1 &&
          metadata.calculated === false && (
            <>
              <Box key={`graph-${ts_id}`}>
                <GraphManager
                  defaultDataToShow={{
                    Kontrolmålinger: true,
                  }}
                />
              </Box>
              <Divider />
              <StationPageBoxLayout key={`timeseries-${ts_id}`}>
                <ReferenceForm />
              </StationPageBoxLayout>
            </>
          )}
        {pageToShow === stationPages.ALARM && user?.superUser && (
          <>
            <Box key={`graph-${ts_id}`}>
              <GraphManager
                defaultDataToShow={{
                  Kontrolmålinger: true,
                }}
              />
            </Box>
            <Divider />
            <StationPageBoxLayout key={`alarm-${ts_id}`}>
              <Alarms />
            </StationPageBoxLayout>
          </>
        )}
        {pageToShow === stationPages.NØGLER && user?.features?.keys && (
          <StationPageBoxLayout key={loc_id}>
            <LocationAccess />
          </StationPageBoxLayout>
        )}
        {pageToShow === stationPages.KONTAKTER && user?.features?.contacts && (
          <StationPageBoxLayout key={loc_id}>
            <ContactInfo />
          </StationPageBoxLayout>
        )}
        {pageToShow === stationPages.HUSKELISTE && user?.features?.ressources && (
          <StationPageBoxLayout key={loc_id}>
            <Huskeliste />
          </StationPageBoxLayout>
        )}
        {pageToShow === stationPages.BILLEDER && (
          <StationPageBoxLayout key={loc_id}>
            <ImagePage />
          </StationPageBoxLayout>
        )}
        {pageToShow === stationPages.LOKATIONKONFIGURATION && user?.superUser && (
          <StationPageBoxLayout>
            <LocationConfiguration />
          </StationPageBoxLayout>
        )}
      </Layout>
    </AppContextProvider>
  );
}

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({children}: LayoutProps) => {
  const {isTouch, isMobile} = useBreakpoints();
  const {data: locationdata} = useLocationData();
  const setTsId = useDisplayState((state) => state.setTsId);
  const [pageToShow, setPageToShow] = useStationPages();
  const [fullscreen, setFullscreen] = useAtom(fullScreenAtom);

  return (
    <>
      <NavBar key={'station'} zIndex={9999}>
        {isTouch && <NavBar.StationDrawerMenu />}
        <Box display="block" flexGrow={1} overflow="hidden">
          {!isTouch && (
            <Typography pl={1.7} textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
              {locationdata?.loc_name}
            </Typography>
          )}
          {isTouch && <MinimalSelect />}
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" flexShrink={0}>
          {locationdata?.projectno && (
            <Tooltip title="Vis projektside" arrow>
              <IconButton
                size="large"
                href={`https://www.watsonc.dk/calypso/projekt/?project=${locationdata?.projectno}`}
                target="_blank"
                rel="noopener"
                color="inherit"
              >
                <OpenInNewIcon sx={{px: 0}} />
              </IconButton>
            </Tooltip>
          )}
          <BatteryStatus />
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
              setTsId(null);
            }}
          />
        </Box>
      </NavBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
        }}
      >
        <StationDrawer />
        <Box display="flex" flexGrow={1} minWidth={0} flexDirection={'column'} overflow="auto">
          {children}
        </Box>
      </Box>
      {isMobile && <ActionArea />}
    </>
  );
};
