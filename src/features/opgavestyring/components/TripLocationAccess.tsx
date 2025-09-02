import {Box} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo} from 'react';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {TaskLocationAccess} from '~/types';

type TripLocationAccessProps = {
  keys: Array<TaskLocationAccess> | undefined;
};

const TripLocationAccess = ({keys}: TripLocationAccessProps) => {
  const columns = useMemo<MRT_ColumnDef<TaskLocationAccess>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'name',
        size: 100,
      },
      {
        header: 'Type',
        accessorKey: 'type',
        size: 20,
      },
      {
        header: 'Fysisk placering',
        accessorKey: 'physical_location',
        size: 20,
      },
      {
        header: 'Kode',
        accessorKey: 'code',
        size: 20,
      },
      {
        header: 'Kontakt',
        accessorKey: 'contact_name',
        size: 20,
      },
      {
        header: 'Kommentar',
        accessorKey: 'comment',
        size: 20,
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<TaskLocationAccess>> = useMemo(
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
    <Box p={1}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default TripLocationAccess;
