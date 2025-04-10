import {LocationOnRounded, ShowChartRounded, BuildRounded, Error} from '@mui/icons-material';
import {Tabs, Tab, Typography, Grid2, Box} from '@mui/material';
import React, {ReactNode} from 'react';
import {tabsHeight} from '~/consts';
import DefaultInputs from './stamdataComponents/DefaultInputs';
import DGUInputs from '../DGUInputs';
import {useCreateTabState} from '~/hooks/useQueryStateParameters';
import {useFormContext} from 'react-hook-form';
import StamdataLocation from './StamdataLocation';

type Props = {
  size: number;
};

interface TabPanelProps {
  value: string | null;
  index: string;
  children: ReactNode;
}

function TabPanel({value, index, children}: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      // {...other}
    >
      {value === index && <Box p={1}>{children}</Box>}
    </div>
  );
}

const StamdataFormWrapper = ({size}: Props) => {
  const [tabValue, setTabValue] = useCreateTabState();
  const {
    formState: {errors},
  } = useFormContext();

  console.log(errors);
  return (
    <>
      <Tabs
        value={tabValue !== null ? tabValue : 'lokation'}
        onChange={(_, newValue) => {
          setTabValue(newValue);
        }}
        variant="fullWidth"
        aria-label="simple tabs example"
        sx={{'& .MuiTab-root': {height: tabsHeight, minHeight: tabsHeight, marginTop: 1}}}
      >
        <Tab
          value={'lokation'}
          icon={
            'location' in errors ? (
              <Error sx={{marginTop: 1, color: '#d32f2f'}} />
            ) : (
              <LocationOnRounded sx={{marginTop: 1}} fontSize="small" />
            )
          }
          label={
            <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
              Lokation
            </Typography>
          }
        />
        <Tab
          value={'tidsserie'}
          icon={
            'timeseries' in errors || 'watlevmp' in errors ? (
              <Error sx={{marginTop: 1, color: '#d32f2f'}} />
            ) : (
              <ShowChartRounded sx={{marginTop: 1}} fontSize="small" />
            )
          }
          label={
            <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
              Tidsserie
            </Typography>
          }
        />
        <Tab
          value={'udstyr'}
          icon={<BuildRounded sx={{marginTop: 1}} fontSize="small" />}
          label={
            <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
              Udstyr
            </Typography>
          }
        />
      </Tabs>
      <TabPanel value={tabValue} index={'lokation'}>
        <Grid2 size={size}>
          <StamdataLocation.LoctypeSelect />
        </Grid2>
        <Grid2 container size={12} spacing={1}>
          <DefaultInputs size={size} />
          <DGUInputs size={size} />
        </Grid2>
      </TabPanel>
      <TabPanel value={tabValue} index={'tidsserie'}>
        <Typography>AFVENTER IMPLEMENTERING...</Typography>
      </TabPanel>
      <TabPanel value={tabValue} index={'udstyr'}>
        <Typography>AFVENTER IMPLEMENTERING...</Typography>
      </TabPanel>
    </>
  );
};

export default StamdataFormWrapper;
