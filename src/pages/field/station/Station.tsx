import AddIcon from '@mui/icons-material/Add';
import {Box, Typography} from '@mui/material';
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
        <StationPageBoxLayout>
          <EditUnit />
        </StationPageBoxLayout>
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
      {pageToShow === stationPages.ALGORITHMS && user?.QAPermission && (
        <StationPageBoxLayout>
          <Algorithms />
        </StationPageBoxLayout>
      )}
      {pageToShow === stationPages.JUSTERINGER && user?.QAPermission && <QAHistory />}
      {pageToShow === stationPages.MAALEPUNKT && (
        <StationPageBoxLayout>
          <ReferenceForm />
        </StationPageBoxLayout>
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
  const {isMobile} = useBreakpoints();
  const {data: locationdata} = useLocationData();
  const {data: metadata} = useTimeseriesData();
  const user = useUser();
  const {createStamdata} = useNavigationFunctions();
  return (
    <>
      <NavBar>
        {isMobile ? <NavBar.StationDrawerMenu /> : <NavBar.GoBack />}
        <Box display="block" flexGrow={1} overflow="hidden">
          <Typography pl={1.7} textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
            {locationdata?.loc_name}
          </Typography>
          <MinimalSelect />
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" flexShrink={0}>
          <BatteryStatus />
          <NavBar.Home />
          {user?.adminAccess && <NotificationList />}
          <NavBar.Menu
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
