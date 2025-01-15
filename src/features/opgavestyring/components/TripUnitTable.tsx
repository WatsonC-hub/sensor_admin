import {Box} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo} from 'react';

import {convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {TaskUnits} from '~/types';

type Props = {
  units: Array<TaskUnits> | undefined;
};

const TripUnitTable = ({units}: Props) => {
  const columns = useMemo<MRT_ColumnDef<TaskUnits>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'name',
        size: 100,
      },
      {
        header: 'Tidsserie type',
        accessorKey: 'tstype_name',
        size: 100,
      },
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
      {
        accessorFn: (row) => convertDateWithTimeStamp(row.startdate),
        id: 'startdate',
        header: 'Start dato',
        accessorKey: 'startdate',
        size: 100,
      },
      {
        accessorFn: (row) => convertDateWithTimeStamp(row.enddate),
        id: 'enddate',
        header: 'Slut dato',
        size: 100,
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<TaskUnits>> = useMemo(
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

  const table = useTable<TaskUnits>(
    columns,
    units,
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

export default TripUnitTable;
