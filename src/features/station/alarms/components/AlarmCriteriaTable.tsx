import {Box, Checkbox} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo} from 'react';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {CriteriaTable} from '../types';

const criteriaTypes = [
  {id: 'alarm_high', name: 'Øvre alarmniveau'},
  {id: 'alarm_low', name: 'Nedre alarmniveau'},
  {id: 'attention_high', name: 'Øvre opmærksomhedsniveau'},
  {id: 'attention_low', name: 'Nedre opmærksomhedsniveau'},
] as const;

type AlarmCriteriaTableProps = {
  otherAlarms: Array<CriteriaTable> | undefined;
};

const AlarmCriteriaTable = ({otherAlarms}: AlarmCriteriaTableProps) => {
  const columns = useMemo<MRT_ColumnDef<CriteriaTable>[]>(
    () => [
      {
        header: 'Navn',
        id: 'name',
        accessorFn: (row) => criteriaTypes.find((c) => c.id === row.name)?.name || row.name,
      },
      {
        header: 'Kriteria',
        accessorKey: 'criteria',
      },
      {
        header: 'SMS/Mail/Mobil',
        accessorKey: 'contactType',
        size: 20,
        maxSize: 20,
        Cell: ({cell}) => {
          const {sms, email, call} = cell.row.original;
          return (
            <Box>
              <Checkbox checked={sms} disabled />
              <Checkbox checked={email} disabled />
              <Checkbox checked={call} disabled />
            </Box>
          );
        },
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
