import {Box} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo} from 'react';

import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {TaskRessources} from '~/types';

type Props = {
  ressources: Array<TaskRessources> | undefined;
};

const TripContactTable = ({ressources}: Props) => {
  const columns = useMemo<MRT_ColumnDef<TaskRessources>[]>(
    () => [
      {
        header: 'Kategori',
        accessorKey: 'kategori',
        size: 100,
        grow: false,
      },
      {
        header: 'navn',
        accessorKey: 'navn',
        size: 100,
        enableGrouping: false,
        grow: false,
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<TaskRessources>> = useMemo(
    () => ({
      enableFullScreenToggle: false,
      enableGlobalFilter: false,
      positionExpandColumn: 'first',
      enableColumnActions: false,
      enableColumnFilters: false,
      enablePagination: false,
      enableSorting: false,
      enableTableFooter: false,
      enableStickyHeader: false,
      enableMultiSort: false,
      enableFilters: false,
      groupedColumnMode: 'remove',
      enableGlobalFilterRankedResults: false,
      muiTableContainerProps: {},
      enableGrouping: true,
      enableTopToolbar: false,
      enableFacetedValues: true,
      enableBottomToolbar: false,
      enableExpanding: false,
      enableExpandAll: false,
      //   displayColumnDefOptions: {
      //     'mrt-row-expand'
      //   },
      muiTableHeadCellProps: {
        sx: {
          m: 0,
          py: 0,
          px: 0.5,
        },
      },
      muiTableBodyCellProps: {
        sx: {
          m: 0,
          py: 0,
          px: 0.5,
          whiteSpace: 'pre-line',
        },
      },
      state: {
        grouping: ['kategori'],
      },
      initialState: {
        expanded: true,
        grouping: ['kategori'],
      },
    }),
    []
  );

  const table = useTable<TaskRessources>(
    columns,
    ressources,
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

export default TripContactTable;
