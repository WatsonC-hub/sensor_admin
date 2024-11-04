import {Box} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef} from 'material-react-table';
import React, {useMemo} from 'react';

import {calculateContentHeight} from '~/consts';
import {useTasks} from '~/features/tasks/api/useTasks';
import type {Task} from '~/features/tasks/types';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useQueryTable} from '~/hooks/useTable';

const TasksTable = () => {
  const {get} = useTasks();
  const {station} = useNavigationFunctions();

  const columns = useMemo<MRT_ColumnDef<Task>[]>(
    () =>
      [
        {
          header: 'Dato',
          id: 'dato',
          accessorFn: (row) => convertDateWithTimeStamp(row.due_date),
          sortingFn: (a, b) => (a.original.due_date > b.original.due_date ? 1 : -1),
        },
        {
          accessorKey: 'opgave',
          header: 'Opgave',
        },
        {
          accessorKey: 'ts_id',
          header: 'TS_ID',
          Cell: ({row, renderedCellValue}) => (
            <Box
              sx={{
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
              onClick={() => station(undefined, row.original.ts_id)}
            >
              {renderedCellValue}
            </Box>
          ),
        },
      ] as MRT_ColumnDef<Task>[],
    []
  );

  const table = useQueryTable<Task>(
    columns,
    get,
    {},
    {},
    TableTypes.STATIONTABLE,
    MergeType.RECURSIVEMERGE
  );

  return (
    <Box
      justifyContent={'center'}
      alignSelf={'center'}
      p={1}
      sx={{
        margin: 'auto',
        display: 'flex',
        flexDirection: 'column',
        height: calculateContentHeight(64),
        minWidth: '50%',
        width: '100%',
        maxWidth: '1080px',
        justifySelf: 'center',
      }}
    >
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default TasksTable;