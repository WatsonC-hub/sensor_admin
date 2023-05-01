import React, {useEffect, useState, useMemo} from 'react';
import {
  Container,
  Grid,
  Typography,
  Button,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  CardContent,
  Card,
} from '@mui/material';
import 'date-fns';
import OwnDatePicker from '../../../components/OwnDatePicker';
import {useTheme} from '@mui/material/styles';
import LocationForm from '../Stamdata/components/LocationForm';
import TimeseriesForm from '../Stamdata/components/TimeseriesForm';
import UnitForm from '../Stamdata/components/UnitForm';
import {updateStamdata, apiClient} from 'src/pages/field/fieldAPI';
import AddUnitForm from '../Stamdata/AddUnitForm';
import SaveIcon from '@mui/icons-material/Save';
import moment from 'moment';
import PropTypes from 'prop-types';
import {SwiperSlide} from 'swiper/react';

import {stamdataStore} from '../../../state/store';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import useMediaQuery from '@mui/material/useMediaQuery';
import {metadataPutSchema} from 'src/helpers/zodSchemas';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm, FormProvider, useFormContext} from 'react-hook-form';
import SwiperInstance from './SwiperInstance';

const UnitEndDateDialog = ({openDialog, setOpenDialog, unit, setUdstyrValue, stationId}) => {
  const [date, setdate] = useState(new Date());

  const queryClient = useQueryClient();

  const handleDateChange = (date) => {
    setdate(date);
  };

  const takeHomeMutation = useMutation(
    async () => {
      const {data} = await apiClient.patch(
        `/sensor_field/stamdata/unit_history/${stationId}/${unit.gid}`,
        {
          enddate: moment(date).format('YYYY-MM-DD HH:mm'),
        }
      );
      return data;
    },
    {
      onSuccess: (data) => {
        setOpenDialog(false);
        setUdstyrValue('slutdato', moment(date).format('YYYY-MM-DD HH:mm'));
        toast.success('Udstyret er hjemtaget');
        queryClient.invalidateQueries(['udstyr', stationId]);
      },
    }
  );

  return (
    <Dialog open={openDialog}>
      <DialogTitle>Angiv slutdato</DialogTitle>
      <DialogContent>
        <OwnDatePicker label="Fra" value={date} onChange={(date) => handleDateChange(date)} />
        <DialogActions item xs={4} sm={2}>
          <Button
            autoFocus
            color="secondary"
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={takeHomeMutation.mutate}
          >
            Gem
          </Button>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => {
              setOpenDialog(false);
            }}
          >
            Annuller
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

const UdstyrReplace = ({stationId, selected, setselected}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddUdstyr, setOpenAddUdstyr] = useState(false);
  const [tstype_id, setUnitValue, setUnit] = stamdataStore((store) => [
    store.timeseries.tstype_id,
    store.setUnitValue,
    store.setUnit,
  ]);

  const formMethods = useFormContext();

  const {data} = useQuery(
    ['udstyr', stationId],
    async () => {
      const {data} = await apiClient.get(`/sensor_field/stamdata/unit_history/${stationId}`);
      return data;
    },
    {
      onSuccess: (data) => {
        setselected(data[0].gid);
      },
    }
  );

  const handleChange = (event) => {
    const localUnit = data.filter((elem) => elem.gid === event.target.value)[0];
    setUnit(localUnit);
    setselected(event.target.value);
    formMethods.setValue('unit', {
      unit_uuid: localUnit.uuid,
      startdate: localUnit.startdato,
      enddate: localUnit.slutdato,
    });
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
      </Grid>
      <Grid item xs={12} sm={6}>
        {moment(data?.[0].slutdato) > moment(new Date()) ? (
          <Button
            color="secondary"
            variant="contained"
            onClick={() => {
              setOpenDialog(true);
            }}
          >
            Hjemtag udstyr
          </Button>
        ) : (
          <Button
            color="secondary"
            variant="contained"
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

export default function EditStamdata({setFormToShow, ts_id, metadata}) {
  const [selectedUnit, setSelectedUnit] = useState('');

  const [location, timeseries, unit] = stamdataStore((store) => [
    store.location,
    store.timeseries,
    store.unit,
  ]);

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();

  const metadataEditMutation = useMutation(
    async (data) => {
      const {data: out} = await apiClient.put(`/sensor_field/stamdata/${ts_id}`, data);
      return out;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['stations', metadata.loc_id.toString()]);
        queryClient.invalidateQueries(['udstyr', ts_id]);
      },
    }
  );

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
        startdate: metadata?.startdato,
        enddate: metadata?.slutdato,
      },
    }).data,
  });

  useEffect(() => {
    formMethods.reset(
      metadataPutSchema.safeParse({
        location: {
          ...metadata,
        },
        timeseries: {
          ...metadata,
        },
        unit: {
          ...metadata,
          startdate: metadata?.startdato,
          enddate: metadata?.slutdato,
        },
      }).data
    );
  }, [metadata]);

  useEffect(() => {
    window.scrollTo({top: 300, behavior: 'smooth'});
  }, []);

  const handleUpdate = (values) => {
    toast.promise(() => metadataEditMutation.mutateAsync(values), {
      pending: 'Opdaterer stamdata...',
      success: 'Stamdata er opdateret',
      error: 'Der skete en fejl',
    });
  };

  return (
    <Card
      style={{marginBottom: 25}}
      sx={{
        width: {xs: '100%', sm: '70%'},
        marginLeft: {xs: '0%', sm: '15%'},
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
      }}
    >
      <CardContent>
        <Container fixed>
          <FormProvider {...formMethods}>
            <Typography variant="h5" component="h3" style={{marginBottom: matches ? '3%' : '1%'}}>
              Stamdata
            </Typography>
            <SwiperInstance>
              <SwiperSlide>
                <Box style={{marginTop: matches ? '2%' : ''}}>
                  <UdstyrReplace
                    stationId={ts_id}
                    selected={selectedUnit}
                    setselected={setSelectedUnit}
                  />
                  <UnitForm mode="edit" />
                </Box>
              </SwiperSlide>
              <SwiperSlide>
                <LocationForm mode="edit" />
              </SwiperSlide>
              <SwiperSlide>
                <TimeseriesForm />
              </SwiperSlide>
            </SwiperInstance>

            <Grid
              container
              alignItems="center"
              justifyContent="center"
              style={{marginTop: matches ? '4%' : ''}}
            >
              <Grid item xs={4} sm={4}>
                <Button
                  autoFocus
                  color="secondary"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={formMethods.handleSubmit(handleUpdate, handleUpdate)}
                >
                  Gem
                </Button>
              </Grid>
              <Grid item xs={4} sm={4}>
                <Button
                  color="grey"
                  variant="contained"
                  onClick={() => {
                    setFormToShow(null);
                  }}
                >
                  Annuller
                </Button>
              </Grid>
            </Grid>
          </FormProvider>
        </Container>
      </CardContent>
    </Card>
  );
}
