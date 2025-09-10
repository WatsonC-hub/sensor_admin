import React, {useMemo} from 'react';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import LookupTable from './LookupTable';
import {Box, Typography, Link} from '@mui/material';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import useDetails, {Details} from '../api/useUnits';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import {checkEndDateIsUnset, convertDateWithTimeStamp} from '~/helpers/dateConverter';

const DetailedOverview = () => {
  const {station, location} = useNavigationFunctions();
  const {
    get: {data: units},
  } = useDetails();

  const columns = useMemo<MRT_ColumnDef<Details>[]>(
    () => [
      {
        accessorKey: 'calypso_id',
        header: 'Calypso ID',
        size: 20,
      },
      {
        accessorKey: 'loc_name',
        header: 'Lokation',
        size: 20,
        Cell: ({row}) => {
          return (
            <Link
              sx={{cursor: 'pointer'}}
              onClick={() => {
                if (row.original.loc_id) location(row.original.loc_id, true, false);
              }}
            >
              <Typography color="#000000" fontSize={'0.875rem'}>
                {row.original.loc_name}
              </Typography>
            </Link>
          );
        },
      },
      {
        accessorKey: 'flag',
        header: 'Status',
        size: 20,
        Cell: ({row}) => {
          return (
            <Typography fontSize={'0.875rem'}>
              <NotificationIcon iconDetails={{flag: row.original.flag}} />
            </Typography>
          );
        },
      },
      {
        accessorKey: 'sensor_id',
        header: 'Sensor',
        size: 20,
      },
      {
        accessorKey: 'channel',
        header: 'Kanal',
        size: 20,
      },
      {
        accessorKey: 'parameter',
        header: 'Parameter',
        size: 20,
        Cell: ({row}) => {
          return (
            <Link
              sx={{cursor: 'pointer'}}
              onClick={() => {
                location(row.original.loc_id, true, false);
                station(row.original.ts_id);
              }}
            >
              <Typography color="#000000" fontSize={'0.875rem'}>
                {row.original.parameter}
              </Typography>
            </Link>
          );
        },
      },
      {
        accessorKey: 'enddate',
        header: 'Slutdato',
        size: 20,
        Cell: ({row}) => {
          return (
            <Typography fontSize={'0.875rem'}>
              {row.original.enddate && !checkEndDateIsUnset(row.original.enddate)
                ? convertDateWithTimeStamp(row.original.enddate)
                : 'Ubegrænset'}
            </Typography>
          );
        },
      },
      {
        id: 'timeofmeas',
        accessorFn: (row) => convertDateWithTimeStamp(row.timeofmeas),
        header: 'Sidste måling',
        size: 20,
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<Details>> = {
    positionExpandColumn: 'first',
    enableColumnDragging: false,
    enableExpanding: true,
    enableGrouping: true,
    positionGlobalFilter: 'right',
    // getSubRows: (row) => row.subRows ?? [],
    initialState: {
      showGlobalFilter: true,
      density: 'comfortable',
      grouping: ['calypso_id'],
    },

    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} />;
    },
  };

  const table = LookupTable<Details>(units ?? [], columns, true, options);

  return (
    <Box px={1} py={2}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default DetailedOverview;
