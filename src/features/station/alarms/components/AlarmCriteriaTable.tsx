import {Box} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo} from 'react';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {CriteriaTable} from '../types';

type AlarmCriteriaTableProps = {
  otherAlarms: Array<CriteriaTable> | undefined;
};

const AlarmCriteriaTable = ({otherAlarms}: AlarmCriteriaTableProps) => {
  const columns = useMemo<MRT_ColumnDef<CriteriaTable>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'attention_level',
      },
      {
        header: 'Kriteria',
        accessorKey: 'criteria',
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<CriteriaTable>> = {
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

  const table = useTable<CriteriaTable>(
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

export default AlarmCriteriaTable;
