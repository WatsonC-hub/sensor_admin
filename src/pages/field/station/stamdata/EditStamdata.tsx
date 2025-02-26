import {
  BuildRounded,
  LocationOnRounded,
  ShowChartRounded,
  StraightenRounded,
  SettingsPhoneRounded,
} from '@mui/icons-material';
import {Box, Divider, Tab, Typography, Tabs} from '@mui/material';
import {useEffect} from 'react';

import {tabsHeight} from '~/consts';
import ReferenceForm from '~/features/stamdata/components/stamdata/ReferenceForm';
import StationDetails from '~/features/stamdata/components/StationDetails';
import {stationPages} from '~/helpers/EnumHelper';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useEditTabState, useShowFormState, useStationPages} from '~/hooks/useQueryStateParameters';
import TabPanel from '~/pages/field/overview/TabPanel';
import {useAppContext} from '~/state/contexts';

import EditLocation from './EditLocation';
import EditTimeseries from './EditTimeseries';
import EditUnit from './EditUnit';

export default function EditStamdata() {
  const {isTablet} = useBreakpoints();

  const [pageToShow, setPageToShow] = useStationPages();
  const [tabValue, setTabValue] = useEditTabState();
  const [showForm, setShowForm] = useShowFormState();
  const {ts_id} = useAppContext(['loc_id'], ['ts_id']);
  const {data: metadata} = useTimeseriesData();

  useEffect(() => {
    if (pageToShow === stationPages.STAMDATA) {
      setPageToShow(stationPages.STAMDATA);
      setShowForm(null);
    }
    if (tabValue === null) {
      setTabValue('lokation');
    } else if (tabValue === 'målepunkt' && metadata && metadata.tstype_id !== 1) {
      setTabValue('lokation');
    } else if (
      (tabValue === 'udstyr' || tabValue === 'tidsserie') &&
      metadata &&
      metadata.calculated
    ) {
      setTabValue('lokation');
    } else setTabValue(tabValue);

    if (tabValue !== 'udstyr' && showForm) {
      setShowForm(null);
    }

    return () => {
      setTabValue(null);
    };
  }, [ts_id, metadata?.calculated, tabValue]);

  return (
    <Box
      sx={{boxShadow: 2, margin: 'auto', width: {xs: window.innerWidth, md: 1080}, height: '100%'}}
    >
      <Tabs
        value={tabValue ?? 'lokation'}
        onChange={(_, newValue) => setTabValue(newValue)}
        variant={isTablet ? 'scrollable' : 'fullWidth'}
        aria-label="simple tabs example"
        scrollButtons="auto"
        sx={{'& .MuiTab-root': {height: tabsHeight, minHeight: tabsHeight}, marginTop: 1}}
      >
        <Tab
          value={'lokation'}
          icon={<LocationOnRounded sx={{marginTop: 1}} fontSize="small" />}
          label={
            <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
              Lokation
            </Typography>
          }
        />
        <Tab
          value={'tidsserie'}
          disabled={!metadata || (metadata && (metadata.calculated || ts_id === undefined))}
          icon={<ShowChartRounded sx={{marginTop: 1}} fontSize="small" />}
          label={
            <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
              Tidsserie
            </Typography>
          }
        />
        <Tab
          value={'udstyr'}
          disabled={!metadata || (metadata && (metadata.calculated || ts_id === undefined))}
          icon={<BuildRounded sx={{marginTop: 1}} fontSize="small" />}
          label={
            <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
              Udstyr
            </Typography>
          }
        />
        <Tab
          value={'målepunkt'}
          disabled={!metadata || (metadata && metadata.tstype_id !== 1)}
          icon={
            <StraightenRounded sx={{transform: 'rotate(90deg)', marginTop: 1}} fontSize="small" />
          }
          label={
            <Typography variant={'body2'} marginBottom={1} textTransform={'capitalize'}>
              Reference
            </Typography>
          }
        />
        <Tab
          value={'stationsinformation'}
          icon={<SettingsPhoneRounded sx={{marginTop: 1}} fontSize="small" />}
          label={
            <Typography variant={'body2'} marginBottom={1} textTransform={'capitalize'}>
              Stationsinformation
            </Typography>
          }
        />
      </Tabs>
      <Divider />
      <Box>
        <TabPanel value={tabValue} index={'lokation'}>
          <EditLocation />
        </TabPanel>
        <TabPanel value={tabValue} index={'tidsserie'}>
          <EditTimeseries />
        </TabPanel>
        <TabPanel value={tabValue} index={'udstyr'}>
          <EditUnit />
        </TabPanel>

        <TabPanel value={tabValue} index={'målepunkt'}>
          <ReferenceForm />
        </TabPanel>

        <TabPanel value={tabValue} index={'stationsinformation'}>
          <StationDetails mode={'normal'} />
        </TabPanel>
      </Box>
    </Box>
  );
}
