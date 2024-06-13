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
import {useParams} from 'react-router-dom';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import FabWrapper from '~/components/FabWrapper';
import {tabsHeight} from '~/consts';
import {StationPages} from '~/helpers/EnumHelper';
import {metadataPutSchema} from '~/helpers/zodSchemas';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useSearchParam} from '~/hooks/useSeachParam';

import OwnDatePicker from '../../../components/OwnDatePicker';
import {stamdataStore} from '../../../state/store';
import TabPanel from '../overview/TabPanel';
import AddUnitForm from '../stamdata/AddUnitForm';
import LocationForm from '../stamdata/components/LocationForm';
import ReferenceForm from '../stamdata/components/ReferenceForm';
import TimeseriesForm from '../stamdata/components/TimeseriesForm';
import UnitForm from '../stamdata/components/UnitForm';

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

  const formMethods = useFormContext();

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
    formMethods.setValue(
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
      {data && data.length > 0 && (
        <Grid container spacing={2} alignItems="center" alignContent="center">
          <Grid item xs={12} sm={6}>
            <Select
              id="udstyr_select"
              value={selected}
              onChange={handleChange}
              className="swiper-no-swiping"
            >
              {data?.map((item) => {
                let endDate =
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
            {moment(data?.[0].slutdato) > moment(new Date()) ? (
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
      )}
    </>
  );
};

export default function EditStamdata({ts_id, metadata, canEdit}) {
  // const [selectedUnit, setSelectedUnit] = useState('');
  const [mode, setMode] = useState('view');

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  const [pageToShow] = useSearchParam('page');
  const [tabValue, setTabValue] = useSearchParam('tab');
  const [, setPageToShow] = useSearchParam('page');
  const {stamdata} = useNavigationFunctions();
  const prev_ts_id = stamdataStore((store) => store.timeseries.ts_id);

  useEffect(() => {
    if (tabValue === null) setTabValue('0');
    else if (tabValue === '3' && metadata.tstype_id !== 1) {
      setTabValue('0');
    } else if (tabValue === '2' && metadata.calculated) setTabValue('0');
    else setTabValue(tabValue);

    if (pageToShow === StationPages.STAMDATA && parseInt(ts_id) !== prev_ts_id) {
      setPageToShow(StationPages.STAMDATA);
      stamdata(metadata.loc_id, ts_id, tabValue, {replace: false});
    }
    return () => {
      setTabValue(null);
    };
  }, [ts_id, metadata.calculated, tabValue]);

  const metadataEditMutation = useMutation({
    mutationFn: async (data) => {
      const {data: out} = await apiClient.put(`/sensor_field/stamdata/${ts_id}`, data);
      return out;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['stations', metadata.loc_id.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ['udstyr', ts_id],
      });
    },
  });

  const formMethods = useForm({
    resolver: zodResolver(metadataPutSchema),
    defaultValues: metadataPutSchema.safeParse({
      location: {
        ...metadata,
      },
      timeseries: {
        ...metadata,
      },
      unit: {
        ...metadata,
        gid: -1,
        startdate: metadata?.startdato,
        enddate: metadata?.slutdato,
      },
    }).data,
  });

  const resetFormData = () => {
    formMethods.reset(
      metadataPutSchema.safeParse({
        location: {
          ...metadata,
        },
        timeseries: {
          ...metadata,
        },
        unit: {
          ...formMethods.getValues()?.unit,
          ...metadata,
          startdate: metadata?.startdato,
          enddate: metadata?.slutdato,
        },
      }).data
    );
  };

  useEffect(() => {
    resetFormData();
  }, [metadata]);

  const handleUpdate = (values) => {
    metadataEditMutation.mutate(values, {
      onSuccess: () => {
        toast.success('Stamdata er opdateret');
      },
      onError: (error) => {
        if (error.response?.status !== 409) {
          toast.error('Der skete en fejl');
        } else {
          toast.error(
            <Box>
              Enheden overlapper med følgende periode
              <Box>
                {moment(error.response.data.detail.overlap[0].startdate).format('YYYY-MM-DD HH:mm')}{' '}
                -{moment(error.response.data.detail.overlap[0].enddate).format('YYYY-MM-DD HH:mm')}
              </Box>
            </Box>,
            {
              autoClose: false,
            }
          );
        }
      },
    });
  };

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
            icon={<ShowChartRounded sx={{marginTop: 1}} fontSize="small" />}
            label={
              <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
                Tidsserie
              </Typography>
            }
          />
          <Tab
            value="2"
            disabled={metadata && metadata.calculated}
            icon={<BuildRounded sx={{marginTop: 1}} fontSize="small" />}
            label={
              <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
                Udstyr
              </Typography>
            }
          />
          <Tab
            value="3"
            disabled={metadata.tstype_id !== 1}
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
                Kontakt
              </Typography>
            }
          />
        </Tabs>
        <Divider />
        <Box>
          <TabPanel value={tabValue} index={'0'}>
            <LocationForm mode="edit" />
          </TabPanel>
          <TabPanel value={tabValue} index={'1'}>
            <TimeseriesForm />
          </TabPanel>
          <TabPanel value={tabValue} index="2">
            <UdstyrReplace stationId={ts_id} />
            <UnitForm mode="edit" />
          </TabPanel>
          <TabPanel value={tabValue} index={'3'}>
            <FabWrapper
              icon={<AddCircle />}
              text="Tilføj målepunkt"
              onClick={() => {
                setMode('add');
              }}
              visible={mode === 'view' ? 'visible' : 'hidden'}
            >
              <ReferenceForm mode={mode} setMode={setMode} canEdit={canEdit} ts_id={ts_id} />
            </FabWrapper>
          </TabPanel>
          <TabPanel value={tabValue} index={'4'}>
            Kontaktinformation
          </TabPanel>
          {mode !== 'edit' && tabValue !== '3' && (
            <footer style={{position: 'sticky', bottom: 60, float: 'right'}}>
              <Grid
                container
                alignItems="center"
                justifyContent="right"
                sx={{
                  marginTop: 2,
                  pl: 2,
                  pr: 2,
                }}
              >
                <Grid item xs={12} sm={12}>
                  <Box display="flex" gap={1} justifyContent={{xs: 'flex-end', sm: 'center'}}>
                    <Button bttype="tertiary" onClick={resetFormData}>
                      Annuller
                    </Button>
                    <Button
                      bttype="primary"
                      startIcon={<SaveIcon />}
                      onClick={formMethods.handleSubmit(handleUpdate, (values) =>
                        console.log(values)
                      )}
                      disabled={
                        formMethods.formState.isSubmitting || !formMethods.formState.isDirty
                      }
                    >
                      Gem
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </footer>
          )}
        </Box>
        {import.meta.env.DEV && <DevTool control={formMethods.control} />}
      </Box>
    </FormProvider>
  );
}
