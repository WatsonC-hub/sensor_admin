import {DevTool} from '@hookform/devtools';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  AddCircle,
  BuildRounded,
  LocationOnRounded,
  SettingsPhoneRounded,
  ShowChartRounded,
  StraightenRounded,
} from '@mui/icons-material';
import SaveIcon from '@mui/icons-material/Save';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Select,
  Tab,
  Typography,
  Tabs,
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {FormProvider, useForm, useFormContext} from 'react-hook-form';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import FabWrapper from '~/components/FabWrapper';
import OwnDatePicker from '~/components/OwnDatePicker';
import {tabsHeight} from '~/consts';
import StationDetails from '~/features/stamdata/components/StationDetails';
import {StationPages} from '~/helpers/EnumHelper';
import {
  locationSchema,
  metadataPutSchema,
  stationDetailsSchema,
  timeseriesSchema,
} from '~/helpers/zodSchemas';
import {useSearchParam} from '~/hooks/useSeachParam';
import TabPanel from '~/pages/field/overview/TabPanel';
import AddUnitForm from '~/pages/field/stamdata/AddUnitForm';
import LocationForm from '~/pages/field/stamdata/components/LocationForm';
import ReferenceForm from '~/pages/field/stamdata/components/ReferenceForm';
import StamdataFooter from '~/pages/field/stamdata/components/StamdataFooter';
import TimeseriesForm from '~/pages/field/stamdata/components/TimeseriesForm';
import UnitForm from '~/pages/field/stamdata/components/UnitForm';
import {stamdataStore} from '~/state/store';

const UnitEndDateDialog = ({openDialog, setOpenDialog, unit, setUdstyrValue, stationId}) => {
  const [date, setdate] = useState(new Date());

  const queryClient = useQueryClient();

  const handleDateChange = (date) => {
    setdate(date);
  };

  const takeHomeMutation = useMutation({
    mutationFn: async (payload) => {
      const {data} = await apiClient.patch(
        `/sensor_field/stamdata/unit_history/${stationId}/${unit.gid}`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      setOpenDialog(false);
      setUdstyrValue('slutdato', moment(date).format('YYYY-MM-DD HH:mm'));
      toast.success('Udstyret er hjemtaget');
      queryClient.invalidateQueries({
        queryKey: ['udstyr', stationId],
      });
    },
  });

  return (
    <Dialog open={openDialog}>
      <DialogTitle>Angiv slutdato</DialogTitle>
      <DialogContent>
        <OwnDatePicker label="Fra" value={date} onChange={(date) => handleDateChange(date)} />
        <DialogActions item xs={4} sm={2}>
          <Button
            bttype="tertiary"
            onClick={() => {
              setOpenDialog(false);
            }}
          >
            Annuller
          </Button>
          <Button
            bttype="primary"
            startIcon={<SaveIcon />}
            onClick={() => takeHomeMutation.mutate({enddate: moment(date).toISOString()})}
          >
            Gem
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

const UdstyrReplace = ({stationId}) => {
  const [selected, setselected] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddUdstyr, setOpenAddUdstyr] = useState(false);
  const [tstype_id, setUnitValue, setUnit] = stamdataStore((store) => [
    store.timeseries.tstype_id,
    store.setUnitValue,
    store.setUnit,
  ]);

  const {setValue} = useFormContext();

  const {data} = useQuery({
    queryKey: ['udstyr', stationId],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/stamdata/unit_history/${stationId}`);
      return data;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchIntervalInBackground: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      onSelectionChange(data, selected === '' ? data[0].gid : selected);
    }
  }, [data]);

  const onSelectionChange = (data, gid) => {
    const localUnit = data.filter((elem) => elem.gid === gid)[0];
    const unit = localUnit ?? data[0];
    setUnit(unit);
    setValue(
      'unit',
      {
        gid: unit.gid,
        unit_uuid: unit.uuid,
        startdate: moment(unit.startdato).format('YYYY-MM-DDTHH:mm'),
        enddate: moment(unit.slutdato).format('YYYY-MM-DDTHH:mm'),
      },
      {shouldValidate: true, shouldDirty: false}
    );
    setselected(unit.gid);
  };

  const handleChange = (event) => {
    if (selected !== event.target.value) onSelectionChange(data, event.target.value);
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          {data && data.length > 0 ? (
            <Select
              id="udstyr_select"
              value={selected}
              onChange={handleChange}
              className="swiper-no-swiping"
            >
              {data?.map((item) => {
                const endDate =
                  moment(new Date()) < moment(item.slutdato)
                    ? 'nu'
                    : moment(item?.slutdato).format('YYYY-MM-DD HH:mm');

                return (
                  <MenuItem id={item.gid} key={item.gid} value={item.gid}>
                    {`${moment(item?.startdato).format('YYYY-MM-DD HH:mm')} - ${endDate}`}
                  </MenuItem>
                );
              })}
            </Select>
          ) : (
            <Typography align={'center'} display={'inline-block'}>
              Tilknyt venligst et udstyr
            </Typography>
          )}

          {data && data.length && moment(data?.[0].slutdato) > moment(new Date()) ? (
            <Button
              bttype="primary"
              sx={{marginLeft: 1}}
              onClick={() => {
                setOpenDialog(true);
              }}
            >
              Hjemtag udstyr
            </Button>
          ) : (
            <Button
              bttype="primary"
              sx={{marginLeft: 1}}
              onClick={() => {
                setOpenAddUdstyr(true);
              }}
            >
              Tilføj udstyr
            </Button>
          )}
        </Grid>
        <UnitEndDateDialog
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
          unit={data?.[0]}
          setUdstyrValue={setUnitValue}
          stationId={stationId}
        />
        <AddUnitForm
          udstyrDialogOpen={openAddUdstyr}
          setUdstyrDialogOpen={setOpenAddUdstyr}
          tstype_id={tstype_id}
          mode="edit"
        />
      </Grid>
    </>
  );
};

export default function EditStamdata({ts_id, metadata, canEdit}) {
  // const [selectedUnit, setSelectedUnit] = useState('');
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  const [pageToShow, setPageToShow] = useSearchParam('page');
  const [tabValue, setTabValue] = useSearchParam('tab');
  const [showForm, setShowForm] = useSearchParam('showForm');
  const prev_ts_id = stamdataStore((store) => store.timeseries.ts_id);

  useEffect(() => {
    if (
      pageToShow === StationPages.STAMDATA &&
      parseInt(ts_id) !== prev_ts_id &&
      prev_ts_id !== 0
    ) {
      setPageToShow(StationPages.STAMDATA);
      setShowForm(null);
    }
    if (tabValue === null) {
      setTabValue('0');
    } else if (tabValue === '3' && metadata && metadata.tstype_id !== 1) {
      setTabValue('0');
    } else if (tabValue === '2' && metadata && metadata.calculated) {
      setTabValue('0');
    } else setTabValue(tabValue);

    if (tabValue !== '3' && showForm === 'true') {
      setShowForm(null);
    }

    return () => {
      setTabValue(null);
    };
  }, [ts_id, metadata?.calculated, tabValue]);

  const metadataEditTimeseriesMutation = useMutation({
    mutationFn: async (data) => {
      const {data: out} = await apiClient.put(
        `/sensor_field/stamdata/update_timeseries/${ts_id}`,
        data
      );
      return out;
    },
  });

  const metadataEditLocationMutation = useMutation({
    mutationFn: async (data) => {
      const {data: out} = await apiClient.put(
        `/sensor_field/stamdata/update_location/${metadata.loc_id}`,
        data
      );
      return out;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['stations', metadata.loc_id.toString()],
      });
    },
  });

  const metadataEditUnitMutation = useMutation({
    mutationFn: async (data) => {
      const {data: out} = await apiClient.put(`/sensor_field/stamdata/update_unit/${ts_id}`, data);
      return out;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['udstyr', ts_id],
      });
    },
  });

  const metadataEditStationDetailsMutation = useMutation({
    mutationFn: async (data) => {
      const {data: out} = await apiClient.put(
        `/sensor_field/stamdata/update_station_details/${metadata.loc_id}`,
        data
      );
      return out;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['stations', metadata.loc_id.toString()],
      });
    },
  });

  let schema = locationSchema;
  let schemaData = locationSchema.safeParse({
    location: {
      ...metadata,
    },
  });

  if (metadata && metadata.ressourcer && metadata.ressourcer.length > 0) {
    schema = stationDetailsSchema;
    schemaData = stationDetailsSchema.safeParse({
      location: {
        ...metadata,
      },
      stationDetails: {
        ...metadata,
      },
    });
  }

  if (metadata && metadata.ts_id && !metadata.unit_uuid) {
    schema = timeseriesSchema;
    schemaData = timeseriesSchema.safeParse({
      location: {
        ...metadata,
      },
      timeseries: {
        ...metadata,
      },
      stationDetails: {
        ...metadata,
      },
    });
  }
  if (metadata && metadata.unit_uuid) {
    schema = metadataPutSchema;
    schemaData = metadataPutSchema.safeParse({
      location: {
        ...metadata,
      },
      timeseries: {
        ...metadata,
      },
      unit: {
        ...metadata,
        gid: -1,
        startdate: metadata.startdato,
        enddate: metadata.slutdato,
      },
      stationDetails: {
        ...metadata,
      },
    });
  }

  const formMethods = useForm({
    resolver: zodResolver(schema),
    defaultValues: schemaData.data,
    mode: 'onTouched',
  });

  const {
    formState: {dirtyFields, isSubmitting},
    getValues,
    reset,
    control,
  } = formMethods;

  const resetFormData = () => {
    const result = schema.safeParse({
      location: {
        ...metadata,
      },
      timeseries: {
        ...metadata,
      },
      unit: {
        ...getValues()?.unit,
        ...metadata,
        startdate: metadata?.startdato,
        enddate: metadata?.slutdato,
      },
      stationDetails: {
        ...metadata,
      },
    });
    console.log(result);
    reset(result.data);
  };

  useEffect(() => {
    resetFormData();
  }, [metadata]);

  const handleUpdate = (type) => {
    if (type === 'location') {
      const locationData = getValues('location');
      metadataEditLocationMutation.mutate(locationData, {
        onSuccess: () => {
          toast.success('Lokalitet er opdateret');
        },
      });
    } else if (type === 'timeseries') {
      const timeseriesData = getValues('timeseries');
      metadataEditTimeseriesMutation.mutate(timeseriesData, {
        onSuccess: () => {
          toast.success('Tidsserie er opdateret');
        },
      });
    } else if (type === 'stationDetails') {
      const stationDetailsData = getValues('stationDetails');
      metadataEditStationDetailsMutation.mutate(stationDetailsData, {
        onSuccess: () => {
          toast.success('Stationsinformation er opdateret');
        },
      });
    } else {
      const unitData = getValues('unit');
      metadataEditUnitMutation.mutate(unitData, {
        onSuccess: () => {
          toast.success('Udstyr er opdateret');
        },
        onError: (error) => {
          if (error.response?.status !== 409) {
            toast.error('Der skete en fejl');
          } else {
            toast.error(
              <Box>
                Enheden overlapper med følgende periode
                <Box>
                  {moment(error.response.data.detail.overlap[0].startdate).format(
                    'YYYY-MM-DD HH:mm'
                  )}{' '}
                  -
                  {moment(error.response.data.detail.overlap[0].enddate).format('YYYY-MM-DD HH:mm')}
                </Box>
              </Box>,
              {
                autoClose: false,
              }
            );
          }
        },
      });
    }
  };
  console.log('renreder');
  return (
    <FormProvider {...formMethods}>
      <Box
        sx={{
          boxShadow: 2,
          margin: 'auto',
          width: {xs: window.innerWidth, md: 1080},
          height: '100%',
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant={matches ? 'scrollable' : 'fullWidth'}
          aria-label="simple tabs example"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              height: tabsHeight,
              minHeight: tabsHeight,
            },
            marginTop: 1,
          }}
        >
          <Tab
            value="0"
            icon={<LocationOnRounded sx={{marginTop: 1}} fontSize="small" />}
            label={
              <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
                Lokalitet
              </Typography>
            }
          />
          <Tab
            value="1"
            disabled={ts_id === -1}
            icon={<ShowChartRounded sx={{marginTop: 1}} fontSize="small" />}
            label={
              <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
                Tidsserie
              </Typography>
            }
          />
          <Tab
            value="2"
            disabled={metadata && (metadata.calculated || ts_id === -1)}
            icon={<BuildRounded sx={{marginTop: 1}} fontSize="small" />}
            label={
              <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
                Udstyr
              </Typography>
            }
          />
          <Tab
            value="3"
            disabled={metadata && metadata.tstype_id !== 1}
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
            value="4"
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
          <TabPanel value={tabValue} index={'0'}>
            <LocationForm mode="normal" />
            <StamdataFooter
              cancel={resetFormData}
              handleOpret={() => handleUpdate('location')}
              saveTitle="Gem lokalitet"
              disabled={isSubmitting || !('location' in dirtyFields)}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={'1'}>
            <TimeseriesForm />
            <StamdataFooter
              cancel={resetFormData}
              handleOpret={() => handleUpdate('timeseries')}
              saveTitle="Gem tidsserie"
              disabled={isSubmitting || !('timeseries' in dirtyFields)}
            />
          </TabPanel>
          <TabPanel value={tabValue} index="2">
            <UdstyrReplace stationId={ts_id} />
            <UnitForm mode="edit" />
            <StamdataFooter
              cancel={resetFormData}
              handleOpret={() => handleUpdate('udstyr')}
              saveTitle="Gem udstyr"
              disabled={isSubmitting || !('unit' in dirtyFields)}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={'3'}>
            <FabWrapper
              icon={<AddCircle />}
              text="Tilføj målepunkt"
              onClick={() => {
                setShowForm('true');
              }}
              visible={showForm === null ? 'visible' : 'hidden'}
            >
              <ReferenceForm canEdit={canEdit} ts_id={ts_id} />
            </FabWrapper>
          </TabPanel>
          <TabPanel value={tabValue} index={'4'}>
            <StationDetails mode={'normal'} />
            <StamdataFooter
              cancel={resetFormData}
              handleOpret={() => handleUpdate('stationDetails')}
              saveTitle="Gem information"
              disabled={isSubmitting || !('stationDetails' in dirtyFields)}
            />
          </TabPanel>
        </Box>
        {import.meta.env.DEV && <DevTool control={control} />}
      </Box>
    </FormProvider>
  );
}
