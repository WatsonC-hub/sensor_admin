import {Box, Typography} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo} from 'react';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {ContactTable} from '../types';
import RenderActions from '~/helpers/RowActions';

type AlarmContactTableProps = {
  alarmContacts: Array<ContactTable> | undefined;
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
};

const AlarmContactTable = ({alarmContacts, onEdit, onDelete}: AlarmContactTableProps) => {
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
          const smsString = `${sms.from?.slice(0, 5)} - ${sms.to?.slice(0, 5)}`;
          return (
            <Box display="flex" flexDirection={'column'} alignItems="center">
              {!sms.selected ? (
                <Typography variant="body2">-</Typography>
              ) : (
                <Typography variant="body2">{smsString}</Typography>
              )}
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
          const emailString = `${email.from?.slice(0, 5)} - ${email.to?.slice(0, 5)}`;
          return (
            <Box display="flex" flexDirection={'column'} alignItems="center">
              {!email.selected ? (
                <Typography variant="body2">-</Typography>
              ) : (
                <Typography variant="body2">{emailString}</Typography>
              )}
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
          const callString = `${call.from?.slice(0, 5)} - ${call.to?.slice(0, 5)}`;
          return (
            <Box display="flex" flexDirection={'column'} alignItems="center">
              {!call.selected ? (
                <Typography variant="body2">-</Typography>
              ) : (
                <Typography variant="body2">{callString}</Typography>
              )}
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
    enableBottomToolbar: false,
    enableRowActions: !!onEdit || !!onDelete,
    renderRowActions: ({row}) => (
      <RenderActions
        handleEdit={() => onEdit?.(row.index)}
        onDeleteBtnClick={() => onDelete?.(row.index)}
      />
    ),
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
    <Box alignItems={'center'}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default AlarmContactTable;
