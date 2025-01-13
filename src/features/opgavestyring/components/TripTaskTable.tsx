import {Box} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo} from 'react';

import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {LocationTasks} from '~/types';

type Props = {
  tasks: Array<LocationTasks> | undefined;
};

const TripTaskTable = ({tasks}: Props) => {
  const columns = useMemo<MRT_ColumnDef<LocationTasks>[]>(
    () => [
      {
        header: 'Lokation',
        accessorKey: 'loc_name',
        size: 100,
      },
      {
        header: 'Tidsserie type',
        accessorKey: 'tstype_name',
        size: 100,
      },
      {
        header: 'Tidsserie navn',
        accessorKey: 'ts_name',
        size: 100,
      },
      {
        header: 'Status',
        accessorKey: 'status_name',
        size: 100,
      },
      {
        header: 'Ansvarlig',
        accessorKey: 'display_name',
        size: 100,
      },
      {
        header: 'Due date',
        accessorKey: 'due_date',
        size: 100,
      },
      {
        header: 'Beskrivelse',
        accessorKey: 'description',
        size: 100,
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<LocationTasks>> = useMemo(
    () => ({
      enableFullScreenToggle: false,
      enableGlobalFilter: false,
      enableColumnActions: false,
      enableColumnFilters: false,
      enablePagination: false,
      enableSorting: false,
      enableTableFooter: false,
      enableStickyHeader: false,
      enableMultiSort: false,
      enableFilters: false,
      enableGlobalFilterRankedResults: false,
      muiTableContainerProps: {},
      enableGrouping: false,
      enableTopToolbar: false,
      enableBottomToolbar: false,
      muiTableHeadCellProps: {
        sx: {
          m: 0,
          p: 1,
        },
      },
      muiTableBodyCellProps: {
        sx: {
          m: 0,
          p: 1,
          whiteSpace: 'pre-line',
        },
      },
    }),
    []
  );

  const table = useTable<LocationTasks>(
    columns,
    tasks,
    options,
    undefined,
    TableTypes.TABLE,
    MergeType.SHALLOWMERGE
  );

  return (
    <Box>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default TripTaskTable;
