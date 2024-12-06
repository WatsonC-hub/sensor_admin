import {Box} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo} from 'react';

import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {TaskLocationAccess} from '~/types';

type Props = {
  keys: Array<TaskLocationAccess> | undefined;
};

const TripContactTable = ({keys}: Props) => {
  const columns = useMemo<MRT_ColumnDef<TaskLocationAccess>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'navn',
        size: 100,
      },
      {
        header: 'Kontakt',
        accessorKey: 'contact_name',
        size: 100,
      },
      {
        header: 'Type',
        accessorKey: 'type',
        size: 100,
      },
      {
        header: 'Placering',
        accessorKey: 'placering',
        size: 100,
      },
      {
        header: 'Kode',
        accessorKey: 'kode',
        size: 100,
      },
      {
        header: 'Lokation',
        accessorKey: 'loc_name',
        size: 100,
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<TaskLocationAccess>> = useMemo(
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
    }),
    []
  );

  const table = useTable<TaskLocationAccess>(
    columns,
    keys,
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
