import {Box} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo} from 'react';

import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {TaskUnits} from '~/types';

type Props = {
  units: Array<TaskUnits> | undefined;
};

type ReducedUnits = {
  terminal_type: string;
  sensorinfo: string;
};

const TripUnitTable = ({units}: Props) => {
  const reducedUnits: Record<string, ReducedUnits> | undefined = units?.reduce(
    (acc: Record<string, ReducedUnits>, unit) => {
      if (!acc[unit.terminal_type]) {
        acc[unit.terminal_type] = {
          terminal_type:
            units?.filter((u) => u.terminal_type === unit.terminal_type).length +
            'x ' +
            unit.terminal_type,
          sensorinfo: unit.sensorinfo,
        };
      }
      return acc;
    },
    {}
  );

  units?.sort((a, b) => {
    if (a.name === b.name) {
      if (a.startdate > b.startdate) return -1;
      if (a.startdate < b.startdate) return 1;
    } else if (a.name < b.name) return -1;
    else if (a.name > b.name) return 1;
    return 0;
  });

  const columns = useMemo<MRT_ColumnDef<ReducedUnits>[]>(
    () => [
      // {
      //   header: 'Navn',
      //   accessorKey: 'name',
      //   size: 100,
      // },
      // {
      //   header: 'Tidsserie type',
      //   accessorKey: 'tstype_name',
      //   size: 100,
      // },
      {
        header: 'Terminal',
        accessorKey: 'terminal_type',
        size: 100,
      },
      {
        header: 'Sensor',
        accessorKey: 'sensorinfo',
        size: 100,
      },
      // {
      //   accessorFn: (row) => convertDateWithTimeStamp(row.),
      //   id: 'startdate',
      //   header: 'Start dato',
      //   accessorKey: 'startdate',
      //   size: 100,
      // },
      // {
      //   accessorFn: (row) => convertDateWithTimeStamp(row.enddate),
      //   id: 'enddate',
      //   header: 'Slut dato',
      //   size: 100,
      // },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<ReducedUnits>> = useMemo(
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

  const table = useTable<ReducedUnits>(
    columns,
    reducedUnits ? Object.values(reducedUnits) : undefined,
    options,
    undefined,
    TableTypes.TABLE,
    MergeType.SHALLOWMERGE
  );

  return (
    <Box p={1}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default TripUnitTable;
