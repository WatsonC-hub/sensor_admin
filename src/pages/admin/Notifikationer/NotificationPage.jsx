import React, {useState} from 'react';
import ServiceMap from 'src/pages/admin/Notifikationer/ServiceMap';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';
import _ from 'lodash';
import {Grid, Button, Typography} from '@mui/material';
import TableComponent from 'src/components/TableComponent';
import NotificationTree from './NotificationTree';
import {atom, useAtom} from 'jotai';

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

const lassoFilterAtom = atom(new Set());

const NotificationPage = () => {
  const [lassoFilter, setLassoFilter] = useAtom(lassoFilterAtom);

  const queryClient = useQueryClient();
  const {data, isLoading, error} = useQuery(
    ['overblik'],
    async ({signal}) => {
      const {data} = await apiClient.get(`/sensor_admin/overblik`, {
        signal,
      });
      return data;
    },
    {staleTime: 1000 * 60 * 60 * 24}
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

  // const columns = [
  //   {name: 'stationid', title: 'Tidsserie ID'},
  //   {name: 'opgave', title: 'Opgave'},
  //   {name: 'dato', title: 'Dato'},
  //   {name: 'terminalid', title: 'Terminal ID'},
  //   {name: 'stationname', title: 'Navn'},
  // ];

  var filtered = data?.map((elem) => {
    return {
      ...elem,
      flag: elem.status == 'POSTPONED' ? 1 : elem.flag,
      color: elem.status == 'POSTPONED' ? '#00FF00' : elem.color,
    };
  });
  const sorted = _.reverse(_.sortBy(filtered, ['flag']));
  const mapdata = _.uniqBy(sorted, 'locid');
  const notifications = filtered
    ?.filter((item) => item.opgave != null)
    .map((item, index) => {
      return {
        ...item,
        id: index,
        navigateTo: getNavigation(item),
      };
    })
    .filter((item) => (lassoFilter.size > 0 ? lassoFilter.has(item.locid) : data.length < 20));
  console.log(lassoFilter);
  const numNotifications = _.uniqBy(notifications, 'stationid')?.length;
  const numBattery = notifications?.filter((item) => item.notification_id === 1).length;
  const numLevel = notifications?.filter((item) => item.notification_id === 'Niveau spring').length;
  const numAbnormal = notifications?.filter(
    (item) => item.notification_id === 'Abnormal hændelse'
  ).length;
  const numTilsyn = notifications?.filter((item) => [7, 8].includes(item.notification_id)).length;
  const numPejling = notifications?.filter((item) => [5, 6].includes(item.notification_id)).length;

  return (
    <Grid container>
      <Grid item xs={12} md={6}>
        <ServiceMap data={mapdata} isLoading={isLoading} setLassoFilter={setLassoFilter} />
      </Grid>
      <Grid item xs={12} md={6} p={2}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() =>
            statusMutate.mutate([
              {
                ts_id: 1,
                status: 'POSTPONED',
                notification_id: 3,
                enddate: '2021-10-10T10:10:10',
              },
              {
                ts_id: 2,
                status: 'POSTPONED',
                notification_id: 2,
                enddate: '2021-10-10T10:10:10',
              },
            ])
          }
        >
          Lav til opgave
        </Button>
        <Typography variant="h6">
          Batteriskift: {numBattery} ud af {numNotifications}
        </Typography>
        {/* <Typography variant="h6">
          Niveau spring: {numLevel} ud af {numNotifications}
        </Typography>
        <Typography variant="h6">
          Abnormal hændelse: {numAbnormal} ud af {numNotifications}
        </Typography> */}
        <Typography variant="h6">
          Tilsyn: {numTilsyn} ud af {numNotifications}
        </Typography>
        <Typography variant="h6">
          Pejling: {numPejling} ud af {numNotifications}
        </Typography>
        <NotificationTree notifications={notifications} statusMutate={statusMutate} />
      </Grid>
    </Grid>
  );
};

export default NotificationPage;