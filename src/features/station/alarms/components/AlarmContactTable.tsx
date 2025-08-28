import {Box, Checkbox, Typography} from '@mui/material';
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
        header: 'SMS',
        accessorKey: 'sms',
        size: 20,
        maxSize: 20,
        Cell: ({cell}) => {
          const {sms} = cell.row.original;
          const smsString = `${sms.from} - ${sms.to}`;
          return (
            <Box display="flex" flexDirection={'column'} alignItems="center">
              <Checkbox checked={sms.selected} disabled />
              {sms.selected && <Typography variant="body2">{smsString}</Typography>}
            </Box>
          );
        },
      },
      {
        header: 'Email',
        accessorKey: 'email',
        size: 20,
        maxSize: 20,
        Cell: ({cell}) => {
          const {email} = cell.row.original;
          const emailString = `${email.from} - ${email.to}`;
          return (
            <Box display="flex" flexDirection={'column'} alignItems="center">
              <Checkbox checked={email.selected} disabled />
              {email.selected && <Typography variant="body2">{emailString}</Typography>}
            </Box>
          );
        },
      },
      {
        header: 'Call',
        accessorKey: 'call',
        size: 20,
        maxSize: 20,
        Cell: ({cell}) => {
          const {call} = cell.row.original;
          const callString = `${call.from} - ${call.to}`;
          return (
            <Box display="flex" flexDirection={'column'} alignItems="center">
              <Checkbox checked={call.selected} disabled />
              {call.selected && <Typography variant="body2">{callString}</Typography>}
            </Box>
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
