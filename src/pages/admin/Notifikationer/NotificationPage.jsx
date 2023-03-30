import React, {useState} from 'react';
import ServiceMap from 'src/pages/admin/Notifikationer/ServiceMap';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';
import {reverse, sortBy, uniqBy, uniq} from 'lodash';
import {
  Grid,
  Button,
  Typography,
  Select,
  Box,
  Chip,
  OutlinedInput,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import TableComponent from 'src/components/TableComponent';
import NotificationTree from './NotificationTree';
import {atom, useAtom} from 'jotai';
import {useEffect} from 'react';

const getNavigation = (item) => {
  switch (item.opgave) {
    case 'Niveau spring':
      return `/admin/kvalitetssikring/${item.stationid}`;
    case 'Abnormal hændelse':
      return `/admin/kvalitetssikring/${item.stationid}`;
    default:
      return `/field/location/${item.locid}/${item.stationid}`;
  }
};

const colors = ['Grøn', 'Gul', 'Orange', 'Rød'];
const selectFiltersAtom = atom([0, 1, 2, 3]);
const lassoFilterAtom = atom(new Set());

const NotificationPage = () => {
  const [mapdata, setMapdata] = useState([]);
  const [lassoFilter, setLassoFilter] = useAtom(lassoFilterAtom);
  const [selectFilters, setSelectFilters] = useAtom(selectFiltersAtom);
  const [isCustomerService, setIsCustomerService] = useState(false);

  const queryClient = useQueryClient();
  const {data, isLoading, error} = useQuery(
    ['overblik'],
    async ({signal}) => {
      const {data} = await apiClient.get(`/sensor_admin/overblik`, {
        signal,
      });
      return data;
    },

    {
      staleTime: 1000 * 60 * 60 * 24,
    }
  );

  const statusMutate = useMutation(
    async (data) => {
      const {data: out} = await apiClient.post(`/sensor_admin/overblik/update_status`, data);
      return out;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('overblik');
      },
    }
  );

  useEffect(() => {
    const sorted = reverse(
      sortBy(
        data?.filter(
          (item) =>
            selectFilters.includes(item.flag) && item.is_customer_service === isCustomerService
        ),
        [(item) => (item.status ? item.status : 'aaaaaaaaa'), (item) => item.flag]
      )
    );
    setMapdata(uniqBy(sorted, 'locid'));
  }, [selectFilters, isCustomerService, data]);

  const trelloMutate = useMutation(async (data) => {
    const {data: out} = await apiClient.post(`/sensor_admin/overblik/make_jira`, data);
    const {data: out2} = await apiClient.post(`/sensor_admin/overblik/make_trello`, data);
    return out;
  });

  const notifications = data
    ?.map((item, index) => {
      return {
        ...item,
        id: index,
        navigateTo: getNavigation(item),
      };
    })
    .filter((item) => (lassoFilter.size > 0 ? lassoFilter.has(item.locid) : data.length < 20));

  const numNotifications = uniqBy(notifications, 'stationid')?.length;
  const numBattery = notifications?.filter((item) => item.notification_id === 1).length;
  const numLevel = notifications?.filter((item) => item.notification_id === 'Niveau spring').length;
  const numAbnormal = notifications?.filter(
    (item) => item.notification_id === 'Abnormal hændelse'
  ).length;
  const numTilsyn = notifications?.filter((item) => [7, 8].includes(item.notification_id)).length;
  const numPejling = notifications?.filter((item) => [5, 6].includes(item.notification_id)).length;

  const handleChange = (event) => {
    const {
      target: {value},
    } = event;
    setSelectFilters(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value
    );
  };

  return (
    <Grid container>
      <Grid item xs={12} md={6}>
        <Select
          multiple
          sx={{width: '40%', m: 1}}
          value={selectFilters}
          onChange={handleChange}
          input={<OutlinedInput label="Filter" />}
          label="Filter"
          renderValue={(selected) => (
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
              {selected.map((value) => (
                <Chip
                  key={value}
                  label={colors[value]}
                  onMouseDown={(e) => e.stopPropagation()}
                  onDelete={() => setSelectFilters(selectFilters.filter((item) => item !== value))}
                />
              ))}
            </Box>
          )}
        >
          {colors.map((name, index) => (
            <MenuItem key={name} value={index}>
              {name}
            </MenuItem>
          ))}
        </Select>
        <FormControlLabel
          control={<Checkbox onChange={(e) => setIsCustomerService(e.target.checked)} />}
          label="Vis kundeservice"
        />
        <ServiceMap data={mapdata} isLoading={isLoading} setLassoFilter={setLassoFilter} />
      </Grid>
      <Grid item xs={12} md={6} p={2}>
        {/* <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            trelloMutate.mutate(notifications);
            statusMutate.mutate(
              notifications.map((item) => ({
                ts_id: item.stationid,
                status: 'SCHEDULED',
                notification_id: item.notification_id,
                enddate: moment().format('YYYY-MM-DDTHH:mm:ss'),
              }))
            );
          }}
        >
          Lav til opgave
        </Button> */}
        <Typography variant="h6">
          Batteriskift: {numBattery} ud af {numNotifications}
        </Typography>
        <Typography variant="h6">
          Niveau spring: {numLevel} ud af {numNotifications}
        </Typography>
        <Typography variant="h6">
          Abnormal hændelse: {numAbnormal} ud af {numNotifications}
        </Typography>
        <Typography variant="h6">
          Tilsyn: {numTilsyn} ud af {numNotifications}
        </Typography>
        <Typography variant="h6">
          Pejling: {numPejling} ud af {numNotifications}
        </Typography>
        <NotificationTree
          notifications={notifications}
          statusMutate={statusMutate}
          trelloMutate={trelloMutate}
        />
      </Grid>
    </Grid>
  );
};

export default NotificationPage;
