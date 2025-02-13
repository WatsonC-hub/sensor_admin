import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import {Box, IconButton, Tooltip} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {atom} from 'jotai';
import React, {useMemo} from 'react';

import {apiClient} from '~/apiClient';
import NavBar from '~/components/NavBar';
import TableComponent from '~/components/TableComponent';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

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
  const {adminKvalitetssikring, field} = useNavigationFunctions();
  const rowActions = ({row}) => (
    <Box>
      <Tooltip arrow title="Gå til kvalitetssikring" enterTouchDelay={0}>
        <IconButton
          size="small"
          sx={{backgroundColor: 'secondary.main'}}
          onClick={() =>
            // navigate(`/admin/kvalitetssikring/${row.original.ts_id}`)
            adminKvalitetssikring(row.original.ts_id)
          }
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

  const {data: tabledata, isLoading} = useQuery({
    queryKey: ['station_list'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station_list`);
      return data;
    },
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
  });

  return (
    <>
      <NavBar>
        <NavBar.GoBack />
        <NavBar.Title title="Admin" />
        <Box display="flex" justifyContent="center" alignItems="center" flexShrink={0}>
          <NavBar.Menu
            highligtFirst={false}
            items={[
              {
                title: 'Field',
                icon: <BuildCircleIcon fontSize="medium" />,
                onClick: () => {
                  field();
                },
              },
            ]}
          />
        </Box>
      </NavBar>
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
