import React from 'react';
import TableComponent from 'src/components/TableComponent';
import {useQuery} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';

const QualityAssuranceOverview = () => {
  const columns = [
    {name: 'calypso_id', title: 'Calypso ID'},
    {name: 'ts_name', title: 'Stationsnavn'},
    {name: 'tstype_name', title: 'Parameter'},
  ];

  const {data: tabledata, isLoading} = useQuery(
    ['station_list'],
    async () => {
      const {data} = await apiClient.get(`/sensor_field/station_list`);
      return data;
    },
    {
      select: (tabledata) => {
        return tabledata.map((row) => {
          return {
            ...row,
            navigateTo: row.ts_id.toString(),
          };
        });
      },
    }
  );

  return <TableComponent data={tabledata} loading={false} columns={columns} />;
};

export default QualityAssuranceOverview;
