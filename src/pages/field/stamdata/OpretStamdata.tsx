import {zodResolver} from '@hookform/resolvers/zod';
import {
  BuildRounded,
  LocationOnRounded,
  SettingsPhoneRounded,
  ShowChartRounded,
} from '@mui/icons-material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import {Grid, TextField, Typography, Box, Tabs, Tab, Divider} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useMutation, useQuery} from '@tanstack/react-query';
import moment from 'moment';
import React, {ReactNode, useEffect, useState} from 'react';
import {FormProvider, useForm, useFormContext} from 'react-hook-form';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import NavBar from '~/components/NavBar';
import AddUnitForm from '~/components/stamdataComponents/AddUnitForm';
import KontaktForm from '~/components/stamdataComponents/KontaktForm';
import LocationForm from '~/components/stamdataComponents/LocationForm';
import TimeseriesForm from '~/components/stamdataComponents/TimeseriesForm';
import UnitForm from '~/components/stamdataComponents/UnitForm';
import {tabsHeight} from '~/consts';
import AddLocationForm from '~/features/stamdata/components/AddLocationForm';
import {metadataSchema} from '~/helpers/zodSchemas';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useSearchParam} from '~/hooks/useSeachParam';
import {stamdataStore} from '~/state/store';

interface LocationChooserProps {
  setLocationDialogOpen: (openDialog: boolean) => void;
}

type Location = {
  loc_id: string;
  loc_name: string;
  mainloc: string;
  subloc: string;
  subsubloc: string;
  x: number;
  y: number;
  groups: string[];
  terrainqual: string;
  terrainlevel: number;
  description: string;
  loctype_id: number;
};

function LocationChooser({setLocationDialogOpen}: LocationChooserProps) {
  const location = stamdataStore((store) => store.location);
  const [selectedLoc, setSelectedLoc] = useState(location.loc_id ? location : {loc_name: ''});
  const formMethods = useFormContext();

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  const populateFormData = (locData: Location) => {
    setSelectedLoc(locData);
    if (locData) {
      formMethods.reset({
        location: {
          loc_id: locData.loc_id,
          loc_name: locData.loc_name,
          mainloc: locData.mainloc,
          subloc: locData.subloc,
          subsubloc: locData.subsubloc,
          groups: locData.groups,
          x: locData.x,
          y: locData.y,
          terrainqual: locData.terrainqual,
          terrainlevel: locData.terrainlevel,
          description: locData.description,
          loctype_id: locData.loctype_id,
        },
      });
    } else {
      formMethods.reset({
        location: {
          loc_name: '',
          mainloc: '',
          subloc: '',
          subsubloc: '',
          x: '',
          y: '',
          groups: [],
          terrainqual: '',
          terrainlevel: '',
          description: '',
          loctype_id: '',
        },
      });
    }
  };

  const {data: locations} = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const {data} = await apiClient.get('/sensor_field/stamdata/locations');
      return data;
    },
  });

  const desktopChooser = (
    <>
      <Grid item xs={12} sm={6}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'start',
          }}
        >
          <Typography>Lokation</Typography>

          <Autocomplete
            value={selectedLoc}
            options={locations ? locations : []}
            getOptionLabel={(option) => option.loc_name}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                variant="outlined"
                placeholder="Vælg lokalitet"
                style={{marginTop: '-6px'}}
              />
            )}
            style={{width: 200, marginLeft: '12px'}}
            onChange={(event, value) => {
              console.log(value);
              populateFormData(
                locations.find((location: Location) => location.loc_name === value?.loc_name)
              );
            }}
          />

          <Button
            size="small"
            bttype="primary"
            sx={{
              textTransform: 'none',
              ml: '12px',
            }}
            onClick={() => setLocationDialogOpen(true)}
          >
            Tilføj ny lokation
          </Button>
        </Box>
      </Grid>
      {/* <Grid item xs={12} sm={6}></Grid> */}
    </>
  );

  const mobileChooser = (
    <>
      <Grid item xs={12}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'end',
            justifyContent: 'start',
          }}
        >
          <Autocomplete
            value={selectedLoc}
            options={locations ? locations : []}
            getOptionLabel={(option) => option.loc_name}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                variant="outlined"
                placeholder="Vælg lokalitet"
                style={{marginTop: '-6px'}}
              />
            )}
            disableClearable
            style={{width: '100%', margin: '0 auto'}}
            onChange={(event, value) =>
              populateFormData(
                locations.find((location: Location) => location.loc_name === value?.loc_name)
              )
            }
          />
          <Button
            bttype="primary"
            size="small"
            sx={{
              ml: 1,
            }}
            startIcon={<AddLocationAltIcon />}
            onClick={() => setLocationDialogOpen(true)}
          >
            Opret lokalitet
          </Button>
        </Box>
      </Grid>
    </>
  );

  return matches ? mobileChooser : desktopChooser;
}

function Location({setLocationDialogOpen}: LocationChooserProps) {
  return (
    <Grid container>
      <LocationChooser setLocationDialogOpen={setLocationDialogOpen} />
      <LocationForm disable />
    </Grid>
  );
}

interface TabPanelProps {
  value: string | null;
  index: string;
  children: ReactNode;
}

function TabPanel({children, value, index, ...other}: TabPanelProps) {
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

interface StamdataProps {
  setAddStationDisabled: (stationDisabled: boolean) => void;
}

export default function OpretStamdata({setAddStationDisabled}: StamdataProps) {
  const {field} = useNavigationFunctions();
  const store = stamdataStore();
  const [udstyrDialogOpen, setUdstyrDialogOpen] = React.useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = React.useState(
    store.location.x ? (store.location.loc_id ? false : true) : false
  );
  // const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    return () => {
      store.resetLocation();
      store.resetTimeseries();
      store.resetUnit();
    };
  }, []);

  const [tabValue, setTabValue] = useSearchParam('tab');

  const formMethods = useForm({
    resolver: zodResolver(metadataSchema),
    defaultValues: {
      location: {
        ...store.location,
      },
      timeseries: {
        tstype_id: -1,
      },
      unit: {
        startdate: store.unit.startdato,
        unit_uuid: store.unit.uuid,
      },
      watlevmp: {},
    },
    mode: 'onTouched',
  });

  const {
    formState: {isSubmitting, errors},
    reset,
    watch,
    getValues,
    handleSubmit,
  } = formMethods;

  const watchtstype_id = watch('timeseries.tstype_id');

  const stamdataNewMutation = useMutation({
    mutationFn: async (data) => {
      const {data: out} = await apiClient.post(`/sensor_field/stamdata/`, data);
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

  const handleDebug = (error: any) => {
    console.log('values', getValues());
    console.log('error', error);
  };

  const handleOpret = async () => {
    setAddStationDisabled(false);
    const form = {
      location: {
        ...getValues()?.location,
      },
      timeseries: {
        ...getValues()?.timeseries,
      },
      unit: {
        startdate: store.unit.startdato,
        unit_uuid: store.unit.uuid,
      },
      watlevmp: {},
    };

    if (getValues()?.timeseries.tstype_id === 1) {
      form['watlevmp'] = {
        startdate: moment(store.unit.startdato).format('YYYY-MM-DD'),
        ...getValues()?.watlevmp,
      };
    }

    try {
      await toast.promise(() => stamdataNewMutation.mutateAsync(form), {
        pending: 'Opretter stamdata...',
        success: 'Stamdata oprettet!',
        error: 'Noget gik galt!',
      });

      // navigate('/field');
      field();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (tabValue === '') setTabValue('0');
    else setTabValue(tabValue !== null ? tabValue : '');
    return () => {
      setTabValue('');
    };
  }, []);

  console.log('errors', errors);
  console.log('values', getValues());

  return (
    <>
      <NavBar />
      <div>
        <FormProvider {...formMethods}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
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
                  Lokalitet
                </Typography>
              }
            />

            <Tab
              value="1"
              icon={<SettingsPhoneRounded sx={{marginTop: 1}} fontSize="small" />}
              label={
                <Typography variant={'body2'} marginBottom={1} textTransform={'capitalize'}>
                  Kontakt
                </Typography>
              }
            />
            <Tab
              value="2"
              icon={<ShowChartRounded sx={{marginTop: 1}} fontSize="small" />}
              label={
                <Typography marginBottom={1} variant="body2" textTransform={'capitalize'}>
                  Tidsserie
                </Typography>
              }
            />
            <Tab
              value="3"
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
            {/* <Typography variant="h6" component="h3">
              Stamdata
            </Typography> */}
            <TabPanel value={tabValue} index={'0'}>
              <Location setLocationDialogOpen={setLocationDialogOpen} />
            </TabPanel>
            <TabPanel value={tabValue} index={'1'}>
              <KontaktForm />
            </TabPanel>
            <TabPanel value={tabValue} index={'2'}>
              {/* <Typography>Tidsserie</Typography> */}
              <TimeseriesForm mode="add" />
            </TabPanel>
            <TabPanel value={tabValue} index={'3'}>
              {/* <Typography>Udstyr</Typography> */}
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
            </TabPanel>
            <footer style={{position: 'sticky', bottom: 0, float: 'right'}}>
              <Box display="flex" gap={1} justifyContent="flex-end" justifySelf="end">
                <Button
                  bttype="tertiary"
                  onClick={() => {
                    // navigate('/field');
                    field();
                    setAddStationDisabled(false);
                  }}
                >
                  Annuller
                </Button>

                {tabValue !== null && tabValue < '3' && (
                  <Button
                    bttype="primary"
                    sx={{marginRight: 1}}
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    onClick={() => {
                      setTabValue((parseInt(tabValue) + 1).toString());
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      Videre
                    </Box>
                  </Button>
                )}
                {tabValue == '3' && (
                  <Button
                    bttype="primary"
                    onClick={handleSubmit(handleOpret, handleDebug)}
                    startIcon={<SaveIcon />}
                    sx={{marginRight: 1}}
                    disabled={isSubmitting}
                  >
                    Gem
                  </Button>
                )}
              </Box>
            </footer>
          </Box>

          <AddUnitForm
            udstyrDialogOpen={udstyrDialogOpen}
            setUdstyrDialogOpen={setUdstyrDialogOpen}
            tstype_id={watchtstype_id}
          />
          <AddLocationForm
            locationDialogOpen={locationDialogOpen}
            setLocationDialogOpen={setLocationDialogOpen}
            // formMethods={formMethods}
          />
          {/* <DevTool control={control} /> */}
        </FormProvider>
      </div>
    </>
  );
}
