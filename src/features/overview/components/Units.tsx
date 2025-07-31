import React, {useMemo} from 'react';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import LookupTable from './LookupTable';
import {Box, Typography} from '@mui/material';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import useUnits, {Unit} from '../api/useUnits';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';

const Units = () => {
  const {
    get: {data: units},
  } = useUnits();

  const columns = useMemo<MRT_ColumnDef<Unit>[]>(
    () => [
      {
        accessorKey: 'projectno',
        header: 'Projekt nummer',
        size: 20,
      },
      {
        accessorKey: 'project_title',
        header: 'Projekt titel',
        size: 20,
        aggregationFn: 'unique',
        AggregatedCell: ({cell}) => (
          <>
            <Typography fontWeight={'bold'} color={'#000000'} fontSize={'0.875rem'}>
              {cell.getValue<string>()}
            </Typography>
          </>
        ),
      },
      {
        accessorKey: 'calypso_id',
        header: 'CALYPSO ID',
        size: 20,
      },
      {
        accessorKey: 'terminal_id',
        header: 'Terminal ID',
        size: 20,
      },
      {
        header: 'Startdato',
        id: 'startdate',
        accessorFn: (row) => convertDateWithTimeStamp(row.startdate),
        size: 120,
      },
      {
        accessorKey: 'loc_name',
        header: 'Lokation',
        size: 20,
      },
      {
        accessorKey: 'mainloc',
        header: 'Hovedlokation',
        size: 20,
      },
      {
        accessorKey: 'description',
        header: 'Beskrivelse',
        size: 20,
      },
      {
        header: 'Data',
        id: 'ts_data',
        accessorFn: (row) =>
          row.ts_data && row.ts_data.length > 0 ? row.ts_data?.join(', ') : 'Ukendt',
        size: 20,
      },
      {
        header: 'Logger',
        id: 'ts_logtype',
        accessorFn: (row) =>
          row.ts_logtype && row.ts_logtype.length > 0 ? row.ts_logtype?.join(', ') : 'Ukendt',
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<Unit>> = {
    positionExpandColumn: 'first',
    enableColumnDragging: false,
    enableExpanding: true,
    enableGrouping: true,
    positionGlobalFilter: 'right',
    getSubRows: (row) => row.subRows ?? [],
    initialState: {
      showGlobalFilter: true,
      density: 'comfortable',
      grouping: ['projectno'],
    },
    getRowCanExpand: (row) => {
      return row.depth < 1;
    },
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} />;
    },
  };

  const table = LookupTable<Unit>(units ?? [], columns, true, options);

  return (
    <Box px={1} py={2}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default Units;
