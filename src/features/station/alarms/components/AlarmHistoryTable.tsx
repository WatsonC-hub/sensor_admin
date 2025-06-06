import {Box} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo} from 'react';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {AlarmHistory} from '~/types';

type AlarmHistoryTableProps = {
  alarmHistory: Array<AlarmHistory> | undefined;
};

const AlarmHistoryTable = ({alarmHistory}: AlarmHistoryTableProps) => {
  const columns = useMemo<MRT_ColumnDef<AlarmHistory>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'name',
      },
      {
        header: 'Dato',
        accessorFn: (row) => convertDateWithTimeStamp(row.date),
        id: 'date',
      },
      {
        header: 'Kontakt type',
        accessorKey: 'sent_type',
      },
      {
        header: 'Alarm',
        accessorKey: 'alarm',
      },
      {
        header: 'Nedre alarm niveau',
        accessorKey: 'alarm_low',
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<AlarmHistory>> = {
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
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

  const table = useTable<AlarmHistory>(
    columns,
    alarmHistory,
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

export default AlarmHistoryTable;
