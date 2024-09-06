import {DevTool} from '@hookform/devtools';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  AddCircle,
  BuildRounded,
  LocationOnRounded,
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
  Tab,
  Typography,
  Tabs,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {FormProvider, useForm, useFormContext} from 'react-hook-form';
import {toast} from 'react-toastify';
import {z} from 'zod';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import FabWrapper from '~/components/FabWrapper';
import FormInput from '~/components/FormInput';
import {tabsHeight} from '~/consts';
import {StationPages} from '~/helpers/EnumHelper';
import {locationSchema, metadataPutSchema, timeseriesSchema} from '~/helpers/zodSchemas';
import {useSearchParam} from '~/hooks/useSeachParam';
import TabPanel from '~/pages/field/overview/TabPanel';
import AddUnitForm from '~/pages/field/stamdata/AddUnitForm';
import LocationForm from '~/pages/field/stamdata/components/LocationForm';
import ReferenceForm from '~/pages/field/stamdata/components/ReferenceForm';
import StamdataFooter from '~/pages/field/stamdata/components/StamdataFooter';
import TimeseriesForm from '~/pages/field/stamdata/components/TimeseriesForm';
import UnitForm from '~/pages/field/stamdata/components/UnitForm';
import {authStore, stamdataStore} from '~/state/store';

const unitEndSchema = z.object({
  enddate: z.string(),
  change_reason: z.number().optional(),
  action: z.string().optional(),
  comment: z.string().optional(),
});

type UnitEndFormValues = z.infer<typeof unitEndSchema>;

interface UnitEndDateDialogProps {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  unit: any;
  setUdstyrValue: (key: string, value: string) => void;
  stationId: string;
}

type ChangeReason = {
  id: number;
  reason: string;
  default_actions: string | null;
};

const UnitEndDateDialog = ({
  openDialog,
  setOpenDialog,
  unit,
  setUdstyrValue,
  stationId,
}: UnitEndDateDialogProps) => {
  const queryClient = useQueryClient();
  const superUser = authStore((store) => store.superUser);

  const {data: changeReasons} = useQuery<ChangeReason[]>({
    queryKey: ['change_reasons'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/stamdata/change-reasons`);
      return data;
    },
  });

  const takeHomeMutation = useMutation({
    mutationFn: async (payload: UnitEndFormValues) => {
      const {data} = await apiClient.post(
        `/sensor_field/stamdata/unit_history/end/${stationId}/${unit.gid}`,
        payload
      );
      return data;
    },
    onSuccess: (_, {enddate}) => {
      setOpenDialog(false);
      setUdstyrValue('slutdato', moment(enddate).format('YYYY-MM-DD HH:mm'));
      toast.success('Udstyret er hjemtaget');
      queryClient.invalidateQueries({
        queryKey: ['udstyr', stationId],
      });
    },
  });

  const formMethods = useForm<UnitEndFormValues>({
    resolver: zodResolver(unitEndSchema),
    defaultValues: {
      enddate: moment().toISOString(),
    },
  });

  const submit = (values: UnitEndFormValues) => {
    values.enddate = moment(values.enddate).toISOString();
    takeHomeMutation.mutate(values);
  };

  return (
    <Dialog open={openDialog}>
      <DialogTitle>Angiv information</DialogTitle>
      <DialogContent
        sx={{
          width: 300,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <FormProvider {...formMethods}>
          <FormInput
            name="enddate"
            label="Fra"
            fullWidth
            type="datetime-local"
            required
            inputProps={{
              min: moment(unit?.startdate).format('YYYY-MM-DDTHH:mm'),
            }}
          />

          {superUser && (
            <>
              <FormInput
                name="change_reason"
                fullWidth
                select
                label="Årsag"
                placeholder="Vælg årsag"
                onChangeCallback={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const reason = changeReasons?.find(
                    (reason) => reason.id === Number(e.target.value)
                  );
                  if (reason) {
                    console.log('reason', reason);
                    formMethods.setValue('action', reason.default_actions ?? 'DO_NOTHING');
                  }
                }}
              >
                {changeReasons?.map((reason) => (
                  <MenuItem key={reason.id} value={reason.id}>
                    {reason.reason}
                  </MenuItem>
                ))}
              </FormInput>

              <FormInput
                name="action"
                fullWidth
                select
                label="Handling"
                placeholder="Handling"
                // disabled={formMethods.watch('change_reason') !== 1}
              >
                <MenuItem value={'DO_NOTHING'}>Gør ingenting</MenuItem>
                <MenuItem value={'CLOSE_UNIT_INVOICE'}>Luk enhed og fakturering</MenuItem>
              </FormInput>

              <FormInput
                name="comment"
                label="Kommentar"
                fullWidth
                multiline
                rows={4}
                placeholder="Skriv en kommentar"
              />
            </>
          )}
        </FormProvider>
        <DialogActions>
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
            onClick={formMethods.handleSubmit(submit)}
          >
            Gem
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

type UnitHistory = {
  calypso_id: number;
  gid: number;
  slutdato: string;
  sensor_id: string;
  sensorinfo: string;
  ts_id: number;
  uuid: string;
  startdato: string;
  terminal_id: string;
  terminal_type: string;
};

const UdstyrReplace = ({stationId}: {stationId: string}) => {
  const [selected, setselected] = useState<number | ''>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddUdstyr, setOpenAddUdstyr] = useState(false);
  const [tstype_id, setUnitValue, setUnit] = stamdataStore((store) => [
    store.timeseries.tstype_id,
    store.setUnitValue,
    store.setUnit,
  ]);

  const formMethods = useFormContext();

  const {setValue} = formMethods;

  const {data, isPending} = useQuery<UnitHistory[]>({
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
      console.log('data', selected);
      onSelectionChange(data, selected === '' ? data[0].gid : selected);
    }
  }, [data]);

  const onSelectionChange = (data: UnitHistory[], gid: number | '') => {
    const localUnit = data.filter((elem) => elem.gid === gid)[0];
    const unit = localUnit ?? data[0];
    console.log('unitSelectChange', unit);
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

  const handleChange = (event: SelectChangeEvent<number | null>) => {
    if (selected !== event.target.value && data)
      onSelectionChange(data, Number(event.target.value));
  };

  return (
    <>
      <Grid container spacing={2}>
        {isPending && (
          <Grid item xs={12} sm={6}>
            <Typography align={'center'} display={'inline-block'}>
              Henter udstyr...
            </Typography>
          </Grid>
        )}
        {!isPending && (
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
                    <MenuItem id={item.gid.toString()} key={item.gid.toString()} value={item.gid}>
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
        )}
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

interface EditStamdataProps {
  ts_id: string;
  metadata: any;
  canEdit: boolean;
}

type EditValues = z.infer<typeof metadataPutSchema>;
type Location = EditValues['location'];
type Timeseries = EditValues['timeseries'];
type Unit = EditValues['unit'];

export default function EditStamdata({ts_id, metadata, canEdit}: EditStamdataProps) {
  // const [selectedUnit, setSelectedUnit] = useState('');
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  const [pageToShow, setPageToShow] = useSearchParam('page');
  const [tabValue, setTabValue] = useSearchParam('tab');
  const [showForm, setShowForm] = useSearchParam('showForm');
  const prev_ts_id = stamdataStore((store) => store.timeseries.ts_id);

  const loc_id = metadata?.loc_id;
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
    mutationFn: async (data: any) => {
      const {data: out} = await apiClient.put(
        `/sensor_field/stamdata/update_timeseries/${ts_id}`,
        data
      );
      return out;
    },
  });

  const metadataEditLocationMutation = useMutation({
    mutationFn: async (data: any) => {
      const {data: out} = await apiClient.put(
        `/sensor_field/stamdata/update_location/${loc_id}`,
        data
      );
      return out;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['stations', loc_id.toString()],
      });
    },
  });

  const metadataEditUnitMutation = useMutation({
    mutationFn: async (data: any) => {
      const {data: out} = await apiClient.put(`/sensor_field/stamdata/update_unit/${ts_id}`, data);
      return out;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['udstyr', ts_id],
      });
    },
  });
  let schema: typeof locationSchema | typeof timeseriesSchema | typeof metadataPutSchema;
  schema = locationSchema;

  if (metadata && metadata.ts_id && !metadata.unit_uuid) {
    schema = timeseriesSchema;
  } else if (metadata && metadata.unit_uuid) {
    schema = metadataPutSchema;
  }
  const schemaData = schema.safeParse({
    location: {
      ...metadata,
      initial_project_no: metadata?.projectno,
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
  });

  const formMethods = useForm({
    resolver: zodResolver(schema),
    defaultValues: schemaData.success ? schemaData.data : {},
    mode: 'onTouched',
  });

  const {
    getValues,
    reset,
    control,
    formState: {isSubmitting, dirtyFields},
    watch,
  } = formMethods;

  const unit = watch('unit') as Unit;

  useEffect(() => {
    console.log('unit', unit);
  }, [unit]);

  const resetFormData = () => {
    const result = schema.safeParse({
      location: {
        ...metadata,
        initial_project_no: metadata?.projectno,
      },
      timeseries: {
        ...metadata,
      },
      unit: {
        ...metadata,
        startdate: metadata?.startdato,
        enddate: metadata?.slutdato,
      },
    });
    reset(result.success ? result.data : {});
  };

  useEffect(() => {
    resetFormData();
  }, [metadata]);

  const handleUpdate = (type: 'location' | 'timeseries' | 'unit') => {
    if (type === 'location') {
      const locationData = getValues('location') as Location;
      metadataEditLocationMutation.mutate(locationData, {
        onSuccess: () => {
          toast.success('Lokation er opdateret');
        },
      });
    } else if (type === 'timeseries') {
      //@ts-expect-error - we know it's a timeseries
      const timeseriesData = getValues('timeseries') as Timeseries;
      metadataEditTimeseriesMutation.mutate(timeseriesData, {
        onSuccess: () => {
          toast.success('Tidsserie er opdateret');
        },
      });
    } else {
      //@ts-expect-error - we know it's a unit
      const unitData = getValues('unit') as Unit;

      metadataEditUnitMutation.mutate(
        {
          ...unitData,
          startdate: moment(unitData.startdate).toISOString(),
          enddate: moment(unitData.enddate).toISOString(),
        },
        {
          onSuccess: () => {
            toast.success('Udstyr er opdateret');
          },
        }
      );
    }
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
          value={tabValue ?? '0'}
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
                Lokation
              </Typography>
            }
          />
          <Tab
            value="1"
            disabled={!metadata || (metadata && (metadata.calculated || ts_id === ''))}
            icon={<ShowChartRounded sx={{marginTop: 1}} fontSize="small" />}
            label={
              <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
                Tidsserie
              </Typography>
            }
          />
          <Tab
            value="2"
            disabled={!metadata || (metadata && (metadata.calculated || ts_id === ''))}
            icon={<BuildRounded sx={{marginTop: 1}} fontSize="small" />}
            label={
              <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
                Udstyr
              </Typography>
            }
          />
          <Tab
            value="3"
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
          {/* <Tab
            value="4"
            icon={<SettingsPhoneRounded sx={{marginTop: 1}} fontSize="small" />}
            label={
              <Typography variant={'body2'} marginBottom={1} textTransform={'capitalize'}>
                Kontakt
              </Typography>
            }
          /> */}
        </Tabs>
        <Divider />
        <Box>
          <TabPanel value={tabValue} index={'0'}>
            <LocationForm mode="normal" />
            <StamdataFooter
              cancel={resetFormData}
              handleOpret={() => handleUpdate('location')}
              saveTitle="Gem lokation"
              disabled={isSubmitting || !('location' in dirtyFields)}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={'1'}>
            <TimeseriesForm mode="" />
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
              handleOpret={() => handleUpdate('unit')}
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
              <ReferenceForm canEdit={canEdit} ts_id={Number(ts_id)} />
            </FabWrapper>
          </TabPanel>
          {/* <TabPanel value={tabValue} index={'4'}>
            Kontaktinformation
          </TabPanel> */}
        </Box>
        {import.meta.env.DEV && <DevTool control={control} />}
      </Box>
    </FormProvider>
  );
}
