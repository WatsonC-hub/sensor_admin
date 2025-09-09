import {Box, Typography} from '@mui/material';

import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo} from 'react';

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
        header: 'Terminal',
        accessorKey: 'terminal_name',
        size: 20,
        Cell: ({cell, row}) => (
          <Typography fontSize="0.85rem" display="block">
            {row.original.count + 'x ' + cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        header: 'Sensor',
        accessorKey: 'sensor_names',
        Cell: ({cell}) => (
          <div>
            {(cell.getValue<string[]>() || []).map((sensor_name, index) => (
              <div key={index}>
                <Typography fontSize="0.85rem" display="block">
                  {sensor_name}
                </Typography>
              </div>
            ))}
          </div>
        ),
        size: 220,
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
    <Box p={1}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default TripUnitTable;
