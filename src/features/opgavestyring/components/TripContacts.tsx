import {Box} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo} from 'react';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {TaskContact} from '~/types';

type TripContactsProps = {
  contacts: Array<TaskContact> | undefined;
};

const TripContacts = ({contacts}: TripContactsProps) => {
  const columns = useMemo<MRT_ColumnDef<TaskContact>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'name',
        size: 120,
      },
      {
        header: 'Telefon',
        accessorKey: 'phone',
        size: 20,
      },
      {
        header: 'Email',
        accessorKey: 'email',
        size: 20,
      },
      {
        header: 'Rolle',
        accessorKey: 'role_name',
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

  const options: Partial<MRT_TableOptions<TaskContact>> = useMemo(
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

  const table = useTable<TaskContact>(
    columns,
    contacts,
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

export default TripContacts;
