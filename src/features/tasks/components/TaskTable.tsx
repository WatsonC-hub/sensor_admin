import {Box} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useEffect, useMemo} from 'react';

import {calculateContentHeight} from '~/consts';
import type {Task} from '~/features/tasks/types';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useTable} from '~/hooks/useTable';

import {useTaskStore} from '../store';

const TaskTable = () => {
  // const [shownTasks, setSelectedTask] = taskStore((store) => [
  //   store.shownTasks,
  //   store.setSelectedTask,
  // ]);
  const {shownTasks, setSelectedTask, setShownListTaskIds} = useTaskStore();
  const {station} = useNavigationFunctions();
  // console.log('tasks', shownTasks);
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
          accessorKey: 'name',
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

  const options: Partial<MRT_TableOptions<Task>> = {
    // onColumnFiltersChange: (columnFilters) => {
    //   console.log('columnFilters', columnFilters);
    // },
    // enableRowDragging: true,
    // muiRowDragHandleProps: ({row}) => {
    //   return {
    //     onDragStart: (e) => {
    //       e.dataTransfer.effectAllowed = 'all';
    //       e.dataTransfer.setData('text/plain', row.original.id);
    //     },
    //   };
    // },
    // renderTopToolbar: ({table}) => (
    //   <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
    //     <Box maxWidth={'250px'}>
    //       <TextField
    //         fullWidth
    //         size={'small'}
    //         variant={'outlined'}
    //         placeholder={'Søg...'}
    //         onChange={(e) => {
    //           console.log('search', e.target.value);
    //           if (e.target.value === '') {
    //             setShownListTaskIds([]);
    //             return;
    //           }
    //           const ids = tasks
    //             .filter((task) => task.name.includes(e.target.value))
    //             .map((task) => task.id);
    //           setShownListTaskIds(ids);
    //         }}
    //       />
    //     </Box>
    //   </Box>
    // ),

    muiTableBodyRowProps: (props) => {
      return {
        onClick: () => {
          console.log('clicked', props.row.original.id);
          setSelectedTask(props.row.original.id);
        },
      };
    },
  };

  const table = useTable<Task>(
    columns,
    shownTasks,
    options,
    {},
    TableTypes.TABLE,
    MergeType.RECURSIVEMERGE
  );

  // const filteredIds = table.getFilteredRowModel().rows.map((row) => row.original.id);

  useEffect(() => {
    const globalFilter = table.getState().globalFilter;
    if (globalFilter === '' || globalFilter === undefined || globalFilter === null) {
      setShownListTaskIds([]);
      return;
    }
    const ids = table.getFilteredRowModel().rows.map((row) => row.original.id);
    console.log('ids', ids);
    setShownListTaskIds(ids);
  }, [table.getState().globalFilter]);

  return (
    <Box
      justifyContent={'center'}
      alignSelf={'center'}
      p={1}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: calculateContentHeight(128),
        width: '100%',
        justifySelf: 'center',
      }}
    >
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default TaskTable;
