import {AddAPhotoRounded} from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import {Box, Typography} from '@mui/material';
import moment from 'moment';
import React, {ChangeEvent, createRef, ReactNode, useEffect, useState} from 'react';

import FabWrapper from '~/components/FabWrapper';
import Images from '~/components/Images';
import NavBar from '~/components/NavBar';
import NotificationList from '~/components/NotificationList';
import SaveImageDialog from '~/components/SaveImageDialog';
import {useUser} from '~/features/auth/useUser';
import QAHistory from '~/features/kvalitetssikring/components/QaHistory';
import ReferenceForm from '~/features/stamdata/components/stamdata/ReferenceForm';
import ContactInfo from '~/features/stamdata/components/stationDetails/contacts/ContactInfo';
import LocationAccess from '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccess';
import Huskeliste from '~/features/stamdata/components/stationDetails/ressourcer/Huskeliste';
import ActionArea from '~/features/station/components/ActionArea';
import BatteryStatus from '~/features/station/components/BatteryStatus';
import MinimalSelect from '~/features/station/components/MinimalSelect';
import StationDrawer from '~/features/station/components/StationDrawer';
import {useLocationData, useTimeseriesData} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
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
      {pageToShow === 'pejling' && ts_id !== -1 && <Pejling />}
      {pageToShow === 'tilsyn' && <Tilsyn />}
      {pageToShow === 'generelt udstyr' && (
        <StationPageBoxLayout>
          <EditUnit />
        </StationPageBoxLayout>
      )}
      {pageToShow === 'generelt lokation' && (
        <StationPageBoxLayout>
          <EditLocation />
        </StationPageBoxLayout>
      )}
      {pageToShow === 'generelt tidsserie' && (
        <StationPageBoxLayout>
          <EditTimeseries />
        </StationPageBoxLayout>
      )}
      {pageToShow === 'algoritmer' && (
        <StationPageBoxLayout>
          <Algorithms />
        </StationPageBoxLayout>
      )}
      {pageToShow === 'justeringer' && <QAHistory />}
      {pageToShow === 'målepunkt' && (
        <StationPageBoxLayout>
          <ReferenceForm />
        </StationPageBoxLayout>
      )}
      {pageToShow === 'nøgler' && (
        <StationPageBoxLayout>
          <LocationAccess />
        </StationPageBoxLayout>
      )}
      {pageToShow === 'kontakter' && (
        <StationPageBoxLayout>
          <ContactInfo />
        </StationPageBoxLayout>
      )}
      {pageToShow === 'huskeliste' && user?.ressourcePermission && (
        <StationPageBoxLayout>
          <Huskeliste />
        </StationPageBoxLayout>
      )}
      {pageToShow === 'billeder' && <ImagePage />}
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
        {/* <StationDrawer /> */}
        <Box display="flex" flexGrow={1} gap={1} flexDirection={'column'}>
          {children}
          {isMobile && <ActionArea />}
        </Box>
      </Box>
    </>
  );
};
