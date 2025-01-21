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
        size: 150,
        grow: false,
      },
      {
        header: 'navn',
        accessorKey: 'navn',
        size: 150,
        enableGrouping: false,
        grow: false,
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<TaskRessources>> = useMemo(
    () => ({
      defaultColumn: {
        grow: 1,
        minSize: 200,
        size: 200,
      },
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
