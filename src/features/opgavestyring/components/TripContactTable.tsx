import {Box} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo} from 'react';

import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {TaskContact} from '~/types';

type Props = {
  contacts: Array<TaskContact> | undefined;
};

const TripContactTable = ({contacts}: Props) => {
  const columns = useMemo<MRT_ColumnDef<TaskContact>[]>(
    () => [
      {
        header: 'Lokation',
        accessorKey: 'loc_name',
        size: 100,
      },
      {
        header: 'Navn',
        accessorKey: 'navn',
        size: 100,
      },
      {
        header: 'Rolle',
        accessorKey: 'contact_role_name',
        size: 100,
      },
      {
        header: 'Tlf. nummer',
        accessorKey: 'telefonnummer',
        size: 100,
      },
      {
        header: 'Email',
        accessorKey: 'email',
        size: 100,
      },
      {
        header: 'Kommentar',
        accessorKey: 'comment',
        size: 100,
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<TaskContact>> = useMemo(
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

  const table = useTable<TaskContact>(
    columns,
    contacts,
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
