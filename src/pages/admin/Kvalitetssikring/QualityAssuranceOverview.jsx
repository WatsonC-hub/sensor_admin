import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import {Box, IconButton, Tooltip} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {atom} from 'jotai';
import React, {useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {apiClient} from 'src/apiClient';
import TableComponent from 'src/components/TableComponent';
import useBreakpoints from 'src/hooks/useBreakpoints';
import NavBar from 'src/NavBar';

const tableStateAtom = atom({
  columnVisibility: {
    'mrt-row-expand': false,
  },
  pagination: {
    page: 0,
    pageSize: 10,
    pageIndex: 0,
  },
  density: 'compact',
});

const QualityAssuranceOverview = () => {
  // const columns = [
  //   {name: 'calypso_id', title: 'Calypso ID'},
  //   {name: 'ts_name', title: 'Stationsnavn'},
  //   {name: 'tstype_name', title: 'Parameter'},
  // ];

  const navigate = useNavigate();

  const rowActions = ({row}) => (
    <Box>
      <Tooltip arrow title="Gå til kvalitetssikring" enterTouchDelay={0}>
        <IconButton
          size="small"
          sx={{backgroundColor: 'secondary.main'}}
          onClick={() => navigate(`/admin/kvalitetssikring/${row.original.ts_id}`)}
        >
          <AutoGraphIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const {isTouch} = useBreakpoints();
  const mobileColumns = useMemo(
    () => [
      {
        header: '#',
        accessorKey: 'calypso_id',
        size: 5,
        maxSize: 5,
      },
      {
        header: 'Tidsserienavn',
        accessorKey: 'ts_name',
        enableHiding: false,
      },
      {
        header: 'Parameter',
        accessorKey: 'tstype_name',
      },
    ],
    []
  );

  const columns = useMemo(
    () => [
      {
        header: 'Tidsserie ID',
        accessorKey: 'ts_id',
        enableHide: false,
      },
      {
        header: 'Calypso ID',
        accessorKey: 'calypso_id',
      },
      {
        header: 'Tidsserienavn',
        accessorKey: 'ts_name',
        enableHiding: false,
      },
      {
        header: 'Parameter',
        accessorKey: 'tstype_name',
      },
    ],
    []
  );

  const {data: tabledata, isLoading} = useQuery(
    ['station_list'],
    async () => {
      const {data} = await apiClient.get(`/sensor_field/station_list`);
      return data;
    },
    {
      select: (tabledata) => {
        return tabledata
          .filter((item) => !item.calculated)
          .map((row) => {
            return {
              ...row,
              navigateTo: row.ts_id.toString(),
            };
          });
      },
    }
  );

  return (
    <>
      <NavBar />
      <Box p={2}>
        <TableComponent
          data={tabledata}
          columns={isTouch ? mobileColumns : columns}
          isLoading={isLoading}
          // renderDetailPanel={renderDetailPanel}
          rowActions={rowActions}
          tableStateAtom={tableStateAtom}
        />
      </Box>
    </>
  );
};

export default QualityAssuranceOverview;
