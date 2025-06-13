import {Box, Checkbox} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo} from 'react';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {ContactTable} from '../types';

type AlarmContactTableProps = {
  alarmContacts: Array<ContactTable> | undefined;
};

const AlarmContactTable = ({alarmContacts}: AlarmContactTableProps) => {
  const columns = useMemo<MRT_ColumnDef<ContactTable>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'name',
        size: 20,
      },
      {
        header: 'SMS/Mail/Mobil',
        accessorKey: 'contactType',
        size: 20,
        maxSize: 20,
        Cell: ({cell}) => {
          const {sms, email, call} = cell.row.original;
          return (
            <>
              <Checkbox checked={sms} disabled />
              <Checkbox checked={email} disabled />
              <Checkbox checked={call} disabled />
            </>
          );
        },
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<ContactTable>> = {
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enablePagination: false,
    enableGlobalFilter: false,
    enableTopToolbar: false,
    muiTablePaperProps: {
      sx: {
        width: 'fit-content',
        height: '100%',
      },
    },
    muiTableBodyCellProps: {
      sx: {
        width: 'fit-content',
      },
    },
    muiTableHeadCellProps: {
      sx: {
        width: 'fit-content',
      },
    },
    muiTableContainerProps: {
      sx: {
        width: '100%',
        height: '100%',
      },
    },
  };

  const table = useTable<ContactTable>(
    columns,
    alarmContacts,
    options,
    undefined,
    TableTypes.TABLE,
    MergeType.SHALLOWMERGE
  );

  return (
    <Box alignItems={'center'} height={'100%'} width={'100%'}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default AlarmContactTable;
