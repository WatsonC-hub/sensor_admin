import {Done} from '@mui/icons-material';
import {Box, IconButton} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo} from 'react';

import {calculateContentHeight} from '~/consts';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTasks, type Task} from '~/hooks/query/useTasks';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useQueryTable} from '~/hooks/useTable';

const TasksTable = () => {
  const {getAll, markAsDone} = useTasks();
  const {station} = useNavigationFunctions();

  const columns = useMemo<MRT_ColumnDef<Task>[]>(
    () =>
      [
        {
          header: 'Dato',
          id: 'dato',
          accessorFn: (row) => convertDateWithTimeStamp(row.created_at),
          sortingFn: (a, b) => (a.original.created_at > b.original.created_at ? 1 : -1),
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

  const [tableState] = useStatefullTableAtom<Task>('TaskTableState');

  const options: Partial<MRT_TableOptions<Task>> = {
    renderRowActions: ({row}) => {
      return (
        <IconButton
          sx={{
            pointerEvents: 'auto',
          }}
          aria-label="Mark as done"
          onClick={() =>
            markAsDone.mutate({
              path: row.original.ts_id,
              data: {
                opgave: row.original.opgave,
              },
            })
          }
        >
          <Done />
        </IconButton>
      );
    },
    enableRowActions: true,
    enablePagination: true,
    muiTableHeadCellProps: {
      sx: {
        flex: '0 0 auto',
        fontSize: '0.8rem',
      },
    },
    muiTableBodyCellProps: {
      sx: {
        px: 0.5,
        flex: '0 0 auto',
        fontSize: '0.8rem',
        textWrap: 'wrap',
      },
    },
    muiPaginationProps: {
      showRowsPerPage: true,
    },

    // muiExpandButtonProps: ({row, table}) => ({
    //   sx: {
    //     px: 0,
    //   },
    //   size: 'small',
    // }),
  };

  const table = useQueryTable<Task>(
    columns,
    getAll,
    options,
    tableState,
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
