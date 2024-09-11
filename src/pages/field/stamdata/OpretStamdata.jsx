import {DevTool} from '@hookform/devtools';
import {zodResolver} from '@hookform/resolvers/zod';
import {BuildRounded, LocationOnRounded, ShowChartRounded} from '@mui/icons-material';
import {Grid, Typography, Box, Tabs, Tab, Divider} from '@mui/material';
import {useMutation, useQuery} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import NavBar from '~/components/NavBar';
import {tabsHeight} from '~/consts';
import {metadataSchema} from '~/helpers/zodSchemas';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useSearchParam} from '~/hooks/useSeachParam';
import AddUnitForm from '~/pages/field/stamdata/AddUnitForm';
import LocationForm from '~/pages/field/stamdata/components/LocationForm';
import StamdataFooter from '~/pages/field/stamdata/components/StamdataFooter';
import TimeseriesForm from '~/pages/field/stamdata/components/TimeseriesForm';
import UnitForm from '~/pages/field/stamdata/components/UnitForm';
import {stamdataStore} from '~/state/store';

function TabPanel(props) {
  const {children, value, index, ...other} = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={1}>{children}</Box>}
    </div>
  );
}

export default function OpretStamdata({setAddStationDisabled}) {
  const {field, location: locationNavigate, station: stationNavigate} = useNavigationFunctions();
  const store = stamdataStore();
  const [udstyrDialogOpen, setUdstyrDialogOpen] = React.useState(false);
  const {data: locations} = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const {data} = await apiClient.get('/sensor_field/stamdata/locations');
      return data;
    },
  });

  useEffect(() => {
    return () => {
      store.resetLocation();
      store.resetTimeseries();
      store.resetUnit();
    };
  }, []);

  const [tabValue, setTabValue] = useSearchParam('tab', '0');

  const formMethods = useForm({
    resolver: zodResolver(metadataSchema),
    defaultValues: {
      location: {
        ...store.location,
      },
      timeseries: {
        tstype_id: -1,
      },
    },
    mode: 'onTouched',
  });

  const {
    formState: {errors, dirtyFields},
    reset,
    watch,
    getValues,
    setValue,
    trigger,
    control,
  } = formMethods;

  useEffect(() => {
    if (store.location.loc_id != undefined && locations != undefined) {
      setValue(
        'location',
        locations.find((item) => item.loc_id === store.location.loc_id)
      );
    }
  }, [store.location.loc_id, locations]);

  const watchtstype_id = watch('timeseries.tstype_id');
  const loc_id = watch('location.loc_id');

  const stamdataNewMutation = useMutation({
    mutationFn: async (data) => {
      const {data: out} = await apiClient.post(`/sensor_field/stamdata/`, data);
      return out;
    },
  });

  const stamdataNewLocationMutation = useMutation({
    mutationFn: async (data) => {
      const {data: out} = await apiClient.post(
        `/sensor_field/stamdata/create_location`,
        data.location
      );
      return out;
    },
  });

  const stamdataNewTimeseriesMutation = useMutation({
    mutationFn: async (data) => {
      const {data: out} = await apiClient.post(`/sensor_field/stamdata/create_timeseries`, data);
      return out;
    },
  });

  useEffect(() => {
    store.resetUnit();
    reset((formValues) => {
      return {
        ...formValues,
        unit: {
          startdate: '',
          unit_uuid: '',
        },
      };
    });
  }, [watchtstype_id]);

  const cancel = () => {
    field();
    setAddStationDisabled(false);
  };

  const nextTab = () => {
    if (tabValue !== '3') setTabValue((parseInt(tabValue) + 1).toString());
  };

  useEffect(() => {
    if (tabValue === null && getValues().location.loc_id) setTabValue('1');
  }, [tabValue]);

  const handleLocationOpret = async () => {
    const locationValid = await trigger('location');
    if (locationValid) {
      const location = {
        location: {
          ...getValues().location,
          // initial_project_no: getValues().location.projectno,
        },
      };

      await toast.promise(
        () =>
          stamdataNewLocationMutation.mutateAsync(location, {
            onSuccess: (data) => {
              locationNavigate(data.loc_id);
            },
          }),
        {
          pending: 'Opretter lokation...',
          success: 'lokation oprettet!',
          error: 'Noget gik galt!',
        }
      );
    }
  };

  const handleTimeseriesOpret = async () => {
    const locationValid = await trigger('location');
    const timeseriesValid = await trigger('timeseries');

    let form = null;
    if (locationValid && timeseriesValid) {
      form = {
        location: {
          ...getValues().location,
          // initial_project_no: getValues().location.projectno,
        },
        timeseries: {
          ...getValues().timeseries,
        },
      };

      if (getValues()?.timeseries.tstype_id === 1 && form['unit']) {
        form['watlevmp'] = {
          startdate: moment(store.unit.startdato).format('YYYY-MM-DD'),
          ...getValues()?.watlevmp,
        };
      } else if (getValues()?.timeseries.tstype_id === 1 && !form['unit']) {
        form['watlevmp'] = {
          startdate: moment().format('YYYY-MM-DD'),
          ...getValues()?.watlevmp,
        };
      }

      let text = 'lokation og tidsserie';
      if (!form.location.loc_id) text = 'tidsserie';

      await toast.promise(
        () =>
          stamdataNewTimeseriesMutation.mutateAsync(form, {
            onSuccess: (data) => {
              stationNavigate(data.loc_id, data.ts_id);
            },
          }),
        {
          pending: 'Opretter ' + text + '' + '...',
          success: text + ' oprettet!',
          error: 'Noget gik galt!',
        }
      );
    }
  };

  const handleUnitOpret = async () => {
    const locationValid = await trigger('location');
    const timeseriesValid = await trigger('timeseries');

    let form = null;
    if (locationValid && timeseriesValid) {
      form = {
        location: {
          ...getValues().location,
          // initial_project_no: getValues().location.projectno,
        },
        timeseries: {
          ...getValues().timeseries,
        },
        unit: {
          startdate: store.unit.startdato,
          unit_uuid: store.unit.uuid,
        },
      };

      if (getValues()?.timeseries.tstype_id === 1 && form['unit']) {
        form['watlevmp'] = {
          startdate: moment(store.unit.startdato).format('YYYY-MM-DD'),
          ...getValues()?.watlevmp,
        };
      }

      let text = 'lokation, tidsserie og udstyr';
      if (!form.location.loc_id) text = 'udstyr';

      await toast.promise(
        () =>
          stamdataNewMutation.mutateAsync(form, {
            onSuccess: (data) => {
              stationNavigate(data.loc_id, data.ts_id);
            },
          }),
        {
          pending: 'Opretter ' + text + '' + '...',
          success: text + ' oprettet!',
          error: 'Noget gik galt!',
        }
      );
    }
  };
  return (
    <>
      <NavBar />
      <div>
        <FormProvider {...formMethods}>
          <Tabs
            value={tabValue !== null ? tabValue : '0'}
            onChange={(_, newValue) => {
              setTabValue(newValue);
            }}
            variant="fullWidth"
            aria-label="simple tabs example"
            sx={{
              '& .MuiTab-root': {
                height: tabsHeight,
                minHeight: tabsHeight,
                marginTop: 1,
              },
            }}
          >
            <Tab
              value="0"
              icon={<LocationOnRounded sx={{marginTop: 1}} fontSize="small" />}
              label={
                <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
                  Lokation
                </Typography>
              }
            />
            <Tab
              value="1"
              icon={<ShowChartRounded sx={{marginTop: 1}} fontSize="small" />}
              label={
                <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
                  Tidsserie
                </Typography>
              }
            />
            <Tab
              value="2"
              icon={<BuildRounded sx={{marginTop: 1}} fontSize="small" />}
              label={
                <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
                  Udstyr
                </Typography>
              }
            />
          </Tabs>
          <Divider />
          <Box
            display="flex"
            flexDirection="column"
            sx={{
              maxWidth: '1200px',
              margin: 'auto',
            }}
          >
            <TabPanel value={tabValue} index={'0'}>
              <Grid container>
                <LocationForm disable={loc_id == null ? false : true} />
              </Grid>
              <StamdataFooter
                cancel={cancel}
                nextTab={nextTab}
                disabled={!('location' in dirtyFields)}
                handleOpret={handleLocationOpret}
                type="lokation"
              />
            </TabPanel>
            <TabPanel value={tabValue} index={'1'}>
              <TimeseriesForm mode="add" />
              <StamdataFooter
                cancel={cancel}
                nextTab={nextTab}
                handleOpret={handleTimeseriesOpret}
                disabled={!('timeseries' in dirtyFields)}
                type="tidsserie"
              />
            </TabPanel>
            <TabPanel value={tabValue} index={'2'}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'start',
                }}
              >
                <Button
                  disabled={watchtstype_id === -1}
                  bttype="primary"
                  size="small"
                  sx={{
                    ml: 1,
                  }}
                  onClick={() => setUdstyrDialogOpen(true)}
                >
                  {store.unit.calypso_id === '' ? 'Tilføj Udstyr' : 'Ændre udstyr'}
                </Button>
                {errors?.unit && (
                  <Typography variant="caption" color="error">
                    Vælg udstyr først
                  </Typography>
                )}
              </Box>
              <UnitForm mode="add" />
              <StamdataFooter cancel={cancel} disabled={false} handleOpret={handleUnitOpret} />
            </TabPanel>
          </Box>

          <AddUnitForm
            udstyrDialogOpen={udstyrDialogOpen}
            setUdstyrDialogOpen={setUdstyrDialogOpen}
            tstype_id={watchtstype_id}
          />
          <DevTool control={formMethods.control} />
        </FormProvider>
      </div>
    </>
  );
}
