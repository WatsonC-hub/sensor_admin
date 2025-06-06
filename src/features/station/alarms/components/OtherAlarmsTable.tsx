import {Box} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo} from 'react';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {Alarm} from '~/types';

type OtherAlarmsTableProps = {
  otherAlarms: Array<Alarm> | undefined;
};

const OtherAlarmsTable = ({otherAlarms}: OtherAlarmsTableProps) => {
  const columns = useMemo<MRT_ColumnDef<Alarm>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'name',
      },
      {
        header: 'Kriteria',
        accessorKey: 'criteria',
      },
      {
        header: 'Alarm Interval (timer)',
        accessorKey: 'alarm_interval',
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<Alarm>> = {
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

  const table = useTable<Alarm>(
    columns,
    otherAlarms,
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

export default OtherAlarmsTable;
