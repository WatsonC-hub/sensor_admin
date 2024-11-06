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
const areSetsEqual = (setA, setB) =>
  setA.size === setB.size && [...setA].every((value) => setB.has(value));
const TaskTable = () => {
  // const [shownTasks, setSelectedTask] = taskStore((store) => [
  //   store.shownTasks,
  //   store.setSelectedTask,
  // ]);
  const {tasks, shownTasks, setSelectedTask, setShownListTaskIds} = useTaskStore();
  const {station} = useNavigationFunctions();
  console.log('tasks', shownTasks);
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

  const options: Partial<MRT_TableOptions<Task>> = {
    enableRowDragging: true,
    muiRowDragHandleProps: ({row}) => {
      return {
        onDragStart: (e) => {
          e.dataTransfer.effectAllowed = 'all';
          e.dataTransfer.setData('text/plain', row.original.id);
        },
      };
    },

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
    tasks,
    options,
    {},
    TableTypes.TABLE,
    MergeType.RECURSIVEMERGE
  );

  const filteredIds = table.getFilteredRowModel().rows.map((row) => row.original.id);
  console.log('filteredIds', new Set(filteredIds));
  console.log('filteredIds', new Set(shownTasks.map((task) => task.id)));

  useEffect(() => {
    setShownListTaskIds(filteredIds);
  }, [areSetsEqual(new Set(filteredIds), new Set(shownTasks.map((task) => task.id)))]);

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
