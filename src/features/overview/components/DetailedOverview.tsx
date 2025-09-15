import React, {useMemo} from 'react';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import {Box, Typography, Link} from '@mui/material';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import useDetails, {Details} from '../api/useUnits';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import {checkEndDateIsUnset, convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {setTableBoxStyle} from '~/consts';
import {useTable} from '~/hooks/useTable';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';

const DetailedOverview = () => {
  const {station, location} = useNavigationFunctions();
  const {
    get: {data: units},
  } = useDetails();

  const [tableState] = useStatefullTableAtom<Details>('detailedOverviewTable');

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
              {row.original.loc_name}
            </Link>
          );
        },
      },
      {
        accessorKey: 'flag',
        header: 'Status',
        size: 20,
        Cell: ({row}) => {
          return <NotificationIcon iconDetails={{flag: row.original.flag}} />;
        },
      },
      {
        accessorKey: 'sendintervalminutes',
        header: 'Sende interval (min)',
        size: 20,
      },
      {
        accessorKey: 'sampleintervalminutes',
        header: 'Logge interval (min)',
        size: 20,
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
        accessorKey: 'tstype_name',
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
              {row.original.tstype_name}
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
    enablePagination: false,
    initialState: {
      showGlobalFilter: true,
      density: 'comfortable',
      grouping: ['calypso_id'],
    },
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} />;
    },
    globalFilterFn: 'includesString',
  };

  const table = useTable<Details>(
    columns,
    units ?? [],
    options,
    tableState,
    TableTypes.TABLE,
    MergeType.RECURSIVEMERGE
  );

  return (
    <Box px={1} py={2} sx={setTableBoxStyle(0)}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default DetailedOverview;
