import {Box} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo} from 'react';

import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import {TaskNotifications} from '~/types';

type Props = {
  notifications: Array<TaskNotifications> | undefined;
};

const TripNotificationTable = ({notifications}: Props) => {
  const columns = useMemo<MRT_ColumnDef<TaskNotifications>[]>(
    () => [
      {
        header: 'Lokation',
        accessorKey: 'loc_name',
        size: 20,
      },
      {
        header: 'Tidsserie navn',
        accessorKey: 'ts_name',
        size: 100,
      },
      {
        header: 'Tidsserie type',
        accessorKey: 'tstype_name',
        size: 100,
      },
      {
        header: 'Opgave',
        accessorKey: 'opgave',
        size: 100,
      },
      {
        header: 'Kritikalitet',
        accessorKey: 'color',
        size: 100,
        Cell: ({row}) => {
          return (
            <Box>
              <NotificationIcon
                key={Math.random()}
                iconDetails={{
                  color: row.original.color,
                  flag: row.original.flag,
                  opgave: row.original.opgave,
                  notification_id: row.original.notification_id,
                }}
                enableTooltip={true}
              />
            </Box>
          );
        },
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<TaskNotifications>> = useMemo(
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

  const table = useTable<TaskNotifications>(
    columns,
    notifications,
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

export default TripNotificationTable;
