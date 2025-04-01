import AddIcon from '@mui/icons-material/Add';
import {Box, Divider, Typography} from '@mui/material';
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
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useShowFormState, useStationPages} from '~/hooks/useQueryStateParameters';
import Algorithms from '~/pages/admin/kvalitetssikring/Algorithms';
import Pejling from '~/pages/field/station/pejling/Pejling';
import Tilsyn from '~/pages/field/station/tilsyn/Tilsyn';
import {useAppContext} from '~/state/contexts';
import EditUnit from './stamdata/EditUnit';
import EditTimeseries from './stamdata/EditTimeseries';
import EditLocation from './stamdata/EditLocation';
import ImagePage from './stamdata/ImagePage';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import useBreakpoints from '~/hooks/useBreakpoints';
import StationDrawer from '~/features/station/components/StationDrawer';
import {stationPages} from '~/helpers/EnumHelper';
import PlotGraph from '~/features/station/components/StationGraph';

export default function Station() {
  const {ts_id} = useAppContext(['loc_id', 'ts_id']);
  const {data: metadata} = useTimeseriesData();
  const [showForm] = useShowFormState();
  const [pageToShow, setPageToShow] = useStationPages();
  const user = useUser();

  useEffect(() => {
    setPageToShow(pageToShow);
    if (metadata?.calculated && pageToShow == 'tilsyn') setPageToShow('pejling');
  }, [ts_id, showForm]);

  return (
    <Layout>
      {pageToShow === stationPages.PEJLING && ts_id !== -1 && <Pejling />}
      {pageToShow === stationPages.TILSYN && !metadata?.calculated && <Tilsyn />}
      {pageToShow === stationPages.GENERELTUDSTYR && (
        <>
          <Box>
            <PlotGraph />
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
      {pageToShow === stationPages.ALGORITHMS && user?.QAPermission && <Algorithms />}
      {pageToShow === stationPages.JUSTERINGER && user?.QAPermission && <QAHistory />}
      {pageToShow === stationPages.MAALEPUNKT && (
        <>
          <Box>
            <PlotGraph />
          </Box>
          <Divider />
          <StationPageBoxLayout>
            <ReferenceForm />
          </StationPageBoxLayout>
        </>
      )}
      {pageToShow === stationPages.NØGLER && user?.contactAndKeysPermission && (
        <StationPageBoxLayout>
          <LocationAccess />
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
      {pageToShow === stationPages.BILLEDER && <ImagePage />}
    </Layout>
  );
}

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({children}: LayoutProps) => {
  const {isTouch, isMobile} = useBreakpoints();
  const {data: locationdata} = useLocationData();
  const {data: metadata} = useTimeseriesData();
  const user = useUser();
  const {createStamdata} = useNavigationFunctions();
  const setTsId = useDisplayState((state) => state.setTsId);
  return (
    <>
      <NavBar>
        {isTouch && <NavBar.StationDrawerMenu />}
        <Box display="block" flexGrow={1} overflow="hidden">
          <Typography pl={1.7} textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
            {locationdata?.loc_name}
          </Typography>
          <MinimalSelect />
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" flexShrink={0}>
          <BatteryStatus />
          {user?.adminAccess && <NotificationList />}
          <NavBar.Menu
            disableLogout
            disableProfile
            highligtFirst={false}
            items={[
              {
                title: 'Opret tidsserie',
                icon: <AddIcon />,
                onClick: () => {
                  createStamdata(undefined, {state: {...metadata}});
                },
              },
            ]}
          />

          <NavBar.Close
            onClick={() => {
              setTsId(null);
            }}
          />
        </Box>
      </NavBar>
      <Box
        component="main"
        sx={{flexGrow: 1, display: 'flex', flexDirection: 'row', maxHeight: 'calc(100vh - 64px)'}}
      >
        <StationDrawer />
        <Box
          display="flex"
          flexGrow={1}
          // maxWidth="100%"
          height={'100%'}
          minWidth={0}
          gap={1}
          pb={isMobile ? 8 : 1}
          flexDirection={'column'}
          overflow="auto"
        >
          {children}
        </Box>
        {isMobile && <ActionArea />}
      </Box>
    </>
  );
};
