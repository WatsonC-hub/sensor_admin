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
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {apiClient} from '~/apiClient';
import OwnDatePicker from '../../../components/OwnDatePicker';
import AddUnitForm from '../Stamdata/AddUnitForm';
import LocationForm from '../Stamdata/components/LocationForm';
import TimeseriesForm from '../Stamdata/components/TimeseriesForm';
import UnitForm from '../Stamdata/components/UnitForm';
import {DevTool} from '@hookform/devtools';
import Button from '~/components/Button';

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {stamdataStore} from '../../../state/store';

import {zodResolver} from '@hookform/resolvers/zod';
import useMediaQuery from '@mui/material/useMediaQuery';
import {FormProvider, useForm, useFormContext} from 'react-hook-form';
import {metadataPutSchema} from '~/helpers/zodSchemas';
import {Tabs} from '@mui/material';
import TabPanel from '../Overview/TabPanel';
import FabWrapper from '~/components/FabWrapper';
import {
  AddCircle,
  BuildRounded,
  LocationOnRounded,
  SettingsPhoneRounded,
  ShowChartRounded,
  StraightenRounded,
} from '@mui/icons-material';
import ReferenceForm from '../Stamdata/components/ReferenceForm';
import KontaktForm from '../Stamdata/components/KontaktForm';
import {useSearchParam} from '~/hooks/useSeachParam';

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
    onSuccess: (data) => {
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
            autoFocus
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
    setUnit(localUnit);
    formMethods.setValue(
      'unit',
      {
        gid: gid,
        unit_uuid: localUnit.uuid,
        startdate: moment(localUnit.startdato).format('YYYY-MM-DDTHH:mm'),
        enddate: moment(localUnit.slutdato).format('YYYY-MM-DDTHH:mm'),
      },
      {shouldValidate: true, shouldDirty: false}
    );
    setselected(gid);
  };

  const handleChange = (event) => {
    if (selected !== event.target.value) onSelectionChange(data, event.target.value);
  };

  return (
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
  );
};

export default function EditStamdata({setFormToShow, ts_id, metadata, canEdit}) {
  // const [selectedUnit, setSelectedUnit] = useState('');
  const [mode, setMode] = useState('view');
  const [location, timeseries, unit] = stamdataStore((store) => [
    store.location,
    store.timeseries,
    store.unit,
  ]);

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useSearchParam('tab');

  useEffect(() => {
    if (tabValue === null) setTabValue('0');
    else setTabValue(tabValue);
    return () => {
      setTabValue(null);
    };
  }, []);

  const metadataEditMutation = useMutation({
    mutationFn: async (data) => {
      const {data: out} = await apiClient.put(`/sensor_field/stamdata/${ts_id}`, data);
      return out;
    },
    onSuccess: (data) => {
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
      onSuccess: (data) => {
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
          sx={{
            '& .MuiTab-root': {
              height: '50px',
              minHeight: '50px',
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
            icon={<BuildRounded sx={{marginTop: 1}} fontSize="small" />}
            label={
              <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
                Udstyr
              </Typography>
            }
          />
          <Tab
            value="3"
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
                      autoFocus
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
        <DevTool control={formMethods.control} />
      </Box>
    </FormProvider>
  );
}
