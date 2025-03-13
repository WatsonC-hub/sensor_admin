import {Box, Typography} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import {getIcon} from '~/features/notifications/utils';
import {useTasks} from '~/features/tasks/api/useTasks';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useDisplayState} from '~/hooks/ui';
import {useTable} from '~/hooks/useTable';
import {LocationTasks} from '~/types';

type Props = {
  tasks: Array<LocationTasks> | undefined;
};

const TripTaskTable = ({tasks}: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskId, setTaskId] = useState<string>();
  const {deleteTaskFromItinerary} = useTasks();
  const {itinerary_id: trip_id} = useDisplayState((state) => state);

  const onDeleteBtnClick = (id: string) => {
    deleteTaskFromItinerary.mutate(
      {
        path: `${trip_id}/tasks/${id}`,
      }
      // {
      //   onSuccess: (data, variables) => {
      //     const {path} = variables;
      //     const splitted = path.split('/');
      //     const id = splitted[splitted.length - 1];
      //     const previous = queryClient.getQueryData<Task[]>(['tasks']);
      //     queryClient.setQueryData<Task[]>(
      //       ['tasks'],
      //       previous?.map((task) => {
      //         if (task.id === id) {
      //           const updated = {...task, itinerary_id: null};

      //           return updated;
      //         }
      //         return task;
      //       })
      //     );
      //     queryClient.invalidateQueries({
      //       queryKey: ['itineraries', splitted[0]],
      //     });
      //   },
      // }
    );
    console.log(`itineraries/${trip_id}/tasks/${id}`);
  };

  const value = tasks?.reduce((acc: Record<string, {count: number; name: string}>, task) => {
    if (task.blocks_notifications !== undefined && task.blocks_notifications.length > 0) {
      task.blocks_notifications?.forEach((block) => {
        if (acc[block] === undefined) {
          acc[block] = {count: 1, name: task.notification_name};
        } else acc[block].count += 1;
      });
      return acc;
    } else {
      if (acc[0] === undefined) {
        acc[0] = {count: 1, name: 'Manuelle opgaver'};
      } else acc[0].count += 1;
      return acc;
    }
  }, {});

  const columns = useMemo<MRT_ColumnDef<LocationTasks>[]>(
    () => [
      {
        header: 'Navn',
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
        accessorKey: 'name',
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
          handleEdit={() => null}
          disabled={trip_id ? true : false}
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
    <>
      <Box
        display="flex"
        flexDirection="row"
        pr={2}
        alignItems={'center'}
        justifyContent="space-between"
      >
        <Typography ml={2} variant="h5">
          Opgaver
        </Typography>
        <Box display="flex" flexDirection="row" gap={1}>
          {value &&
            Object.keys(value).map((notification_id) => {
              const id = parseInt(notification_id);
              return (
                <Box key={notification_id} display="flex" flexDirection="row">
                  <Box width={24} height={24}>
                    {getIcon({notification_id: id}, false)}
                  </Box>
                  <Typography alignContent={'center'} variant="body2">
                    {value?.[id].count}x
                  </Typography>
                  &nbsp;
                  <Typography variant="body2" alignContent={'center'}>
                    {value?.[id].name}
                  </Typography>
                </Box>
              );
            })}
        </Box>
      </Box>

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
    </>
  );
};

export default TripTaskTable;
