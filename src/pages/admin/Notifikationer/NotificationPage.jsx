import React, {useState} from 'react';
import ServiceMap from 'src/pages/admin/Notifikationer/ServiceMap';
import {useQuery} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';
import _ from 'lodash';
import {Grid} from '@mui/material';
import TableComponent from 'src/components/TableComponent';

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

const NotificationPage = () => {
  const [lassoFilter, setLassoFilter] = useState(new Set());
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

  const columns = [
    {name: 'stationid', title: 'Tidsserie ID'},
    {name: 'opgave', title: 'Opgave'},
    {name: 'dato', title: 'Dato'},
    {name: 'terminalid', title: 'Terminal ID'},
    {name: 'stationname', title: 'Navn'},
  ];

  const sorted = _.reverse(_.sortBy(data, ['flag']));
  const mapdata = _.uniqBy(sorted, 'locid');
  const table_data = data
    ?.filter((item) => item.opgave != null)
    .map((item, index) => {
      return {
        ...item,
        id: index,
        navigateTo: getNavigation(item),
      };
    })
    .filter((item) => (lassoFilter.size > 0 ? lassoFilter.has(item.locid) : true));

  return (
    <Grid container>
      <Grid item xs={12} md={6}>
        <ServiceMap data={mapdata} isLoading={isLoading} setLassoFilter={setLassoFilter} />;
      </Grid>
      <Grid item xs={12} md={6}>
        <TableComponent data={table_data} columns={columns} loading={isLoading} />
      </Grid>
    </Grid>
  );
};

export default NotificationPage;
