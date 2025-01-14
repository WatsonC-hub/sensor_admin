import {Box} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import {useTaskItinerary} from '~/features/tasks/api/useTaskItinerary';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useTable} from '~/hooks/useTable';
import {LocationTasks} from '~/types';

type Props = {
  tasks: Array<LocationTasks> | undefined;
  trip_id: string | undefined;
};

const TripTaskTable = ({tasks, trip_id}: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskId, setTaskId] = useState<number>();
  const {deleteTaskFromitinerary} = useTaskItinerary();
  const onDeleteBtnClick = (id: number) => {
    deleteTaskFromitinerary.mutate({
      path: `itineraries/${trip_id}/tasks/${id}`,
    });
    console.log(`itineraries/${trip_id}/tasks/${id}`);
  };

  const columns = useMemo<MRT_ColumnDef<LocationTasks>[]>(
    () => [
      {
        header: 'Lokation',
        accessorKey: 'loc_name',
        size: 120,
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
        header: 'Status',
        accessorKey: 'status_name',
        size: 100,
      },
      {
        header: 'Ansvarlig',
        accessorKey: 'display_name',
        size: 100,
      },
      {
        header: 'Due date',
        accessorKey: 'due_date',
        size: 100,
      },
      {
        header: 'Beskrivelse',
        accessorKey: 'description',
        size: 100,
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<LocationTasks>> = useMemo(
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
      enableRowActions: true,
      renderRowActions: ({row}) => (
        <RenderActions
          onDeleteBtnClick={() => {
            setTaskId(row.original.id);
            setDialogOpen(true);
          }}
          canEdit={trip_id ? true : false}
        />
      ),
      muiTableBodyCellProps: {
        sx: {
          m: 0,
          p: 1,
          whiteSpace: 'pre-line',
        },
      },
    }),
    [trip_id]
  );

  const table = useTable<LocationTasks>(
    columns,
    tasks,
    options,
    undefined,
    TableTypes.TABLE,
    MergeType.SHALLOWMERGE
  );

  return (
    <Box>
      <DeleteAlert
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={() => {
          if (taskId) onDeleteBtnClick(taskId);
        }}
      />
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default TripTaskTable;
