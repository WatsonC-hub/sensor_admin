import {Box, Divider, IconButton, Tooltip, Typography} from '@mui/material';
import React, {ReactNode, useEffect} from 'react';

import NavBar from '~/components/NavBar';
import NotificationList from '~/components/NotificationList';
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

export default function Station() {
  const {ts_id} = useAppContext(['loc_id', 'ts_id']);
  const {data: metadata} = useTimeseriesData();
  const [, setShowForm] = useShowFormState();
  const [pageToShow, setPageToShow] = useStationPages();
  const user = useUser();

  useEffect(() => {
    setPageToShow(pageToShow);
    if (
      metadata?.calculated &&
      (pageToShow == 'tilsyn' ||
        pageToShow === 'gu' ||
        pageToShow === 'målepunkt' ||
        pageToShow === 'gt' ||
        pageToShow === 'justeringer' ||
        pageToShow === 'algoritmer')
    )
      setPageToShow('pejling');
    setShowForm(null);
  }, [ts_id, pageToShow]);

  return (
    <Layout>
      {pageToShow === stationPages.PEJLING && ts_id !== -1 && <Pejling />}
      {pageToShow === stationPages.TILSYN && !metadata?.calculated && <Tilsyn />}
      {pageToShow === stationPages.GENERELTUDSTYR && (
        <>
          <Box>
            <GraphManager
              defaultDataToShow={{
                Kontrolmålinger: true,
              }}
            />
          </Box>
          <Divider />
          <StationPageBoxLayout>
            <EditUnit />
          </StationPageBoxLayout>
        </>
      )}
      {pageToShow === stationPages.GENERELTLOKATION && (
        <StationPageBoxLayout>
          <EditLocation />
        </StationPageBoxLayout>
      )}
      {pageToShow === stationPages.GENERELTIDSSERIE && (
        <StationPageBoxLayout>
          <EditTimeseries />
        </StationPageBoxLayout>
      )}
      {pageToShow === stationPages.ALGORITHMS && <Algorithms />}
      {pageToShow === stationPages.JUSTERINGER && <QAHistory />}
      {pageToShow === stationPages.MAALEPUNKT && (
        <>
          <Box>
            <GraphManager
              defaultDataToShow={{
                Kontrolmålinger: true,
              }}
            />
          </Box>
          <Divider />
          <StationPageBoxLayout>
            <ReferenceForm />
          </StationPageBoxLayout>
        </>
      )}
      {pageToShow === stationPages.NØGLER && user?.features.keys && (
        <StationPageBoxLayout>
          <LocationAccess />
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
      {pageToShow === stationPages.BILLEDER && (
        <StationPageBoxLayout>
          <ImagePage />
        </StationPageBoxLayout>
      )}
    </Layout>
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
          <NotificationList />
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
        <Box
          display="flex"
          flexGrow={1}
          minWidth={0}
          gap={1}
          flexDirection={'column'}
          overflow="auto"
        >
          {children}
        </Box>
      </Box>
      {isMobile && <ActionArea />}
    </>
  );
};
