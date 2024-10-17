import {DevTool} from '@hookform/devtools';
import {zodResolver} from '@hookform/resolvers/zod';
import {BuildRounded, Error, LocationOnRounded, ShowChartRounded} from '@mui/icons-material';
import {Grid, Typography, Box, Tabs, Tab, Divider} from '@mui/material';
import {useMutation, useQuery} from '@tanstack/react-query';
import moment from 'moment';
import React, {ReactNode, useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {z} from 'zod';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import NavBar from '~/components/NavBar';
import StamdataFooter from '~/components/StamdataFooter';
import {tabsHeight} from '~/consts';
import AddUnitForm from '~/features/stamdata/components/stamdata/AddUnitForm';
import LocationForm from '~/features/stamdata/components/stamdata/LocationForm';
import TimeseriesForm from '~/features/stamdata/components/stamdata/TimeseriesForm';
import UnitForm from '~/features/stamdata/components/stamdata/UnitForm';
import {locationSchema, metadataSchema, timeseriesSchema} from '~/helpers/zodSchemas';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useSearchParam} from '~/hooks/useSeachParam';
import {stamdataStore} from '~/state/store';
import {FieldLocation} from '~/types';

interface TabPanelProps {
  value: string | null;
  index: string;
  children: ReactNode;
}

function TabPanel({value, index, children, ...other}: TabPanelProps) {
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

interface OpretStamdataProps {
  setAddStationDisabled: (value: boolean) => void;
}

type CreateValues = z.infer<typeof metadataSchema>;
type Timeseries = CreateValues['timeseries'];
type Unit = CreateValues['unit'];
type Watlevmp = CreateValues['watlevmp'];

export default function OpretStamdata({setAddStationDisabled}: OpretStamdataProps) {
  const {location: locationNavigate, station: stationNavigate} = useNavigationFunctions();
  const store = stamdataStore();
  const [udstyrDialogOpen, setUdstyrDialogOpen] = React.useState(false);
  const navigate = useNavigate();

  const {data: locations} = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<FieldLocation>>('/sensor_field/stamdata/locations');
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
      watlevmp: {},
      unit: {
        startdate: '',
        unit_uuid: '',
      },
    },
    mode: 'onTouched',
  });

  const {
    formState: {errors, dirtyFields},
    watch,
    getValues,
    setValue,
    trigger,
  } = formMethods;

  useEffect(() => {
    if (store.location.loc_id != undefined && locations != undefined) {
      const location = locations.find((item) => item.loc_id === store.location.loc_id);
      if (location) setValue('location', location);
    }
  }, [store.location.loc_id, locations]);

  const watchtstype_id = watch('timeseries.tstype_id');
  const loc_id = watch('location.loc_id');

  const stamdataNewMutation = useMutation({
    mutationFn: async (data: {
      location: FieldLocation;
      timeseries: Timeseries;
      unit: Unit;
      watlevmp?: Watlevmp;
    }) => {
      const {data: out} = await apiClient.post(`/sensor_field/stamdata/`, data);
      return out;
    },
  });

  const stamdataNewLocationMutation = useMutation({
    mutationFn: async (data: {location: FieldLocation}) => {
      const {data: out} = await apiClient.post(
        `/sensor_field/stamdata/create_location`,
        data.location
      );
      return out;
    },
  });

  const stamdataNewTimeseriesMutation = useMutation({
    mutationFn: async (data: {
      location: FieldLocation;
      timeseries: Timeseries;
      watlevmp?: Watlevmp;
    }) => {
      const {data: out} = await apiClient.post(`/sensor_field/stamdata/create_timeseries`, data);
      return out;
    },
  });

  useEffect(() => {
    store.resetUnit();
    setValue('unit', {
      startdate: '',
      unit_uuid: '',
    });
    trigger('unit');
  }, [watchtstype_id]);

  const cancel = () => {
    navigate(-1);
    setAddStationDisabled(false);
  };

  const nextTab = async () => {
    let valid = false;

    if (tabValue === '0') {
      valid = await trigger('location');
    } else if (tabValue === '1') {
      valid = await trigger('timeseries');
      const isWaterlevel = getValues()?.timeseries.tstype_id === 1;
      if (isWaterlevel) valid = await trigger('watlevmp');
    }

    if (tabValue && tabValue !== '3' && valid) setTabValue((parseInt(tabValue) + 1).toString());
  };

  useEffect(() => {
    if (tabValue === null && getValues().location.loc_id) setTabValue('1');
  }, [tabValue]);

  const showErrorMessage = (updateType?: string) => {
    console.log(getValues('location'));
    console.log(locationSchema);
    let result = locationSchema.safeParse({
      location: getValues('location'),
    });

    if (updateType === 'timeseries') {
      const isWaterlevel = getValues()?.timeseries.tstype_id === 1;
      result = timeseriesSchema.safeParse({
        location: getValues('location'),
        timeseries: getValues('timeseries'),
        watlevmp: isWaterlevel ? getValues('watlevmp') : undefined,
      });
    } else if (updateType === 'unit') {
      result = metadataSchema.safeParse(getValues());
    }

    if (!result.success) {
      console.log(result);
      const errorMessage = result.error.issues.map((error) => error.message).join('\n');
      console.log(errorMessage);
      toast.error(errorMessage, {
        toastId: 'fejlVedOpretStamdata',
        style: {
          width: '20%',
          minWidth: '300px',
          marginRight: '0%',
          whiteSpace: 'pre-line',
        },
        autoClose: 5000,
      });
    }
  };

  const handleLocationOpret = async () => {
    const locationValid = await trigger('location');

    if (!locationValid) {
      showErrorMessage();
      return;
    }

    const location = {
      location: {
        ...getValues().location,
        // initial_project_no: getValues().location.projectno,
      },
    };

    stamdataNewLocationMutation.mutate(location, {
      onSuccess: (data) => {
        locationNavigate(data.loc_id);
      },
    });
  };

  const handleTimeseriesOpret = async () => {
    const locationValid = await trigger('location');
    const timeseriesValid = await trigger('timeseries');
    const isWaterlevel = getValues()?.timeseries.tstype_id === 1;
    let watlevmpValid = true;
    if (isWaterlevel) {
      watlevmpValid = await trigger('watlevmp');
    }

    if (!locationValid || !timeseriesValid || !watlevmpValid) {
      showErrorMessage('timeseries');
      return;
    }

    const form: {location: FieldLocation; timeseries: Timeseries; watlevmp?: Watlevmp} = {
      location: {
        ...getValues().location,
      },
      timeseries: {
        ...getValues().timeseries,
      },
    };

    if (isWaterlevel) {
      const watlevmp = getValues('watlevmp') as Watlevmp;
      form['watlevmp'] = {
        startdate: moment().format('YYYY-MM-DD'),
        description: watlevmp?.description ?? '',
        elevation: watlevmp?.elevation ?? 0,
      };
    }

    stamdataNewTimeseriesMutation.mutate(form, {
      onSuccess: (data) => {
        stationNavigate(data.loc_id, data.ts_id);
      },
    });
  };

  const handleUnitOpret = async () => {
    const locationValid = await trigger('location');
    const timeseriesValid = await trigger('timeseries');
    const isWaterlevel = getValues()?.timeseries.tstype_id === 1;
    let watlevmpValid = true;
    if (isWaterlevel) {
      watlevmpValid = await trigger('watlevmp');
    }

    if (!locationValid || !timeseriesValid || !watlevmpValid) {
      showErrorMessage('unit');
      return;
    }

    const form: {location: FieldLocation; timeseries: Timeseries; unit: Unit; watlevmp?: Watlevmp} =
      {
        location: {
          ...getValues().location,
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
      const watlevmp = getValues('watlevmp') as Watlevmp;
      form['watlevmp'] = {
        startdate: moment(store.unit.startdato).format('YYYY-MM-DD'),
        description: watlevmp?.description ?? '',
        elevation: watlevmp?.elevation ?? 0,
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
              value="1"
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
                <LocationForm disable={loc_id == null ? false : true} mode={'normal'} />
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
                {errors && 'unit' in errors && (
                  <Typography variant="caption" color="error">
                    Vælg udstyr først
                  </Typography>
                )}
              </Box>
              <UnitForm mode="add" />
              <StamdataFooter
                cancel={cancel}
                disabled={'unit' in getValues() && getValues('unit.unit_uuid') === ''}
                handleOpret={handleUnitOpret}
              />
            </TabPanel>
          </Box>

          <AddUnitForm
            udstyrDialogOpen={udstyrDialogOpen}
            setUdstyrDialogOpen={setUdstyrDialogOpen}
            tstype_id={watchtstype_id}
            mode="normal"
          />
          <DevTool control={formMethods.control} />
        </FormProvider>
      </div>
    </>
  );
}
