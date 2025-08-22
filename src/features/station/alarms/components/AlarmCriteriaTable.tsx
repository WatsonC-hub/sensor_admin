import {Box} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo} from 'react';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import useNotificationType, {NotificationType} from '~/hooks/query/useNotificationTypes';

type AlarmCriteriaTableProps = {
  alarm_notifications: Array<number> | undefined;
};

const AlarmCriteriaTable = ({alarm_notifications}: AlarmCriteriaTableProps) => {
  const {
    get: {data: notifications},
  } = useNotificationType();
  const data = notifications?.filter((n) => alarm_notifications?.some((o) => o === n.gid));
  const columns = useMemo<MRT_ColumnDef<NotificationType>[]>(
    () => [
      {
        header: 'Navn',
        id: 'name',
        accessorFn: (row) => {
          return row.name;
        },
      },
      {
        header: 'Kritiskhed',
        id: 'notification_gid',
        size: 20,
        accessorFn: (row) => {
          const flag = row.flag;
          return flag === 3 ? 'Kritisk' : flag === 2 ? 'Opmærksom' : 'Ukritisk';
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
    MergeType.SHALLOWMERGE
  );

  return (
    <Box alignItems={'center'}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default AlarmCriteriaTable;
