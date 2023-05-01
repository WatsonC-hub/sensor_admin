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

  var data = [
    {
      calypso_id: 34,
      ts_name: 'Haley Avila',
      tstype_name: 'female',
      ts_id: 1034,
    },
    {
      calypso_id: 32,
      ts_name: 'James Norris',
      tstype_name: 'male',
      ts_id: 1123,
    },
    {
      calypso_id: 38,
      ts_name: 'Chandler Kemp',
      tstype_name: 'male',
      ts_id: 806,
    },
    {
      calypso_id: 38,
      ts_name: 'Meredith Cox',
      tstype_name: 'female',
      ts_id: 888,
    },
    {
      calypso_id: 28,
      ts_name: 'Bryan Snow',
      tstype_name: 'male',
      ts_id: 879,
    },
    {
      calypso_id: 30,
      ts_name: 'Natasha Galloway',
      tstype_name: 'female',
      ts_id: 1135,
    },
  ];

  // data = data.map((row) => {
  //   return {
  //     ...row,
  //     navigateTo: row.ts_id.toString(),
  //   };
  // });

  return <TableComponent data={tabledata} loading={false} columns={columns} />;
};

export default QualityAssuranceOverview;
