import AddIcon from '@mui/icons-material/Add';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import {Box, Divider, Typography} from '@mui/material';
import React, {ReactNode, useEffect, useState} from 'react';

import NavBar from '~/components/NavBar';
import NotificationList from '~/components/NotificationList';
import {useUser} from '~/features/auth/useUser';
import ActionArea from '~/features/station/components/ActionArea';
import BatteryStatus from '~/features/station/components/BatteryStatus';
import MinimalSelect from '~/features/station/components/MinimalSelect';
import PlotGraph from '~/features/station/components/StationGraph';
import {stationPages} from '~/helpers/EnumHelper';
import {useLocationData, useTimeseriesData} from '~/hooks/query/useMetadata';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useShowFormState, useStationPages} from '~/hooks/useQueryStateParameters';
import Pejling from '~/pages/field/station/pejling/Pejling';
import EditStamdata from '~/pages/field/station/stamdata/EditStamdata';
import Tilsyn from '~/pages/field/station/tilsyn/Tilsyn';
import {useAppContext} from '~/state/contexts';
import ImagePage from './stamdata/ImagePage';

export default function Station() {
  const {ts_id} = useAppContext(['loc_id', 'ts_id']);
  const {data: metadata} = useTimeseriesData();
  const [showForm] = useShowFormState();
  const [pageToShow, setPageToShow] = useStationPages();
  const [dynamic, setDynamic] = useState<Array<string | number> | undefined>();

  useEffect(() => {
    setPageToShow(pageToShow);
    if (metadata?.calculated && pageToShow == 'tilsyn') setPageToShow('pejling');

    if (showForm === null) setDynamic([]);
  }, [ts_id, showForm]);

  return (
    <Layout>
      {pageToShow !== 'billeder' && pageToShow !== 'stamdata' && (
        <PlotGraph
          key={ts_id}
          dynamicMeasurement={
            pageToShow === stationPages.PEJLING && showForm === true ? dynamic : undefined
          }
        />
      )}
      <Divider />

      {pageToShow === 'pejling' && ts_id !== -1 && <Pejling setDynamic={setDynamic} />}
      {pageToShow === 'tilsyn' && <Tilsyn />}
      {pageToShow === 'stamdata' && <EditStamdata />}
      {pageToShow === 'billeder' && <ImagePage />}
    </Layout>
  );
}

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({children}: LayoutProps) => {
  const {ts_id} = useAppContext(['ts_id']);
  const {data: locationdata} = useLocationData();
  const {data: metadata} = useTimeseriesData();
  const user = useUser();
  const {adminKvalitetssikring, createStamdata} = useNavigationFunctions();
  return (
    <>
      <NavBar>
        <NavBar.GoBack />
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
              ...(user?.adminAccess && !metadata?.calculated
                ? [
                    {
                      title: 'Til QA',
                      onClick: () => {
                        adminKvalitetssikring(ts_id ?? -1);
                      },
                      icon: <AutoGraphIcon />,
                    },
                  ]
                : []),
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
      <main style={{flexGrow: 1}}>
        <Box display="flex" flexDirection={'column'} gap={1}>
          {children}
          <ActionArea />
        </Box>
      </main>
    </>
  );
};
