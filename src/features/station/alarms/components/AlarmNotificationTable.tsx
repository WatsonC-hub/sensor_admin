import {Box, Typography} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo} from 'react';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {NotificationType, useNotificationTypes} from '~/hooks/query/useNotificationOverview';
import {useTable} from '~/hooks/useTable';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';

type AlarmNotificationTableProps = {
  alarm_notifications: Array<number> | undefined;
};

const AlarmNotificationTable = ({alarm_notifications}: AlarmNotificationTableProps) => {
  const {data: notifications} = useNotificationTypes();
  const data = notifications
    ?.filter((n) => alarm_notifications?.some((o) => o === n.gid))
    .sort((a, b) => b.flag - a.flag);
  const columns = useMemo<MRT_ColumnDef<NotificationType>[]>(
    () => [
      {
        header: 'Navn',
        id: 'name',
        accessorFn: (row) => {
          return row.name;
        },
        Cell: ({cell, row}) => {
          return (
            <Box display="flex" alignItems="center" flexDirection="row" color="white" gap={1}>
              <NotificationIcon
                iconDetails={{
                  notification_id: row.original.gid,
                  flag: row.original.flag,
                }}
              />
              <Typography variant="body2" color="textPrimary">
                {cell.getValue<string>()}
              </Typography>
            </Box>
          );
        },
      },
    ],
    [notifications]
  );

  const options: Partial<MRT_TableOptions<NotificationType>> = {
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enablePagination: false,
    enableGlobalFilter: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    muiTablePaperProps: {
      sx: {
        width: 'fit-content',
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
  };

  const table = useTable<NotificationType>(
    columns,
    data ?? [],
    options,
    undefined,
    TableTypes.TABLE,
    MergeType.RECURSIVEMERGE
  );

  return (
    <Box alignItems={'center'} width={'fit-content'}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default AlarmNotificationTable;
