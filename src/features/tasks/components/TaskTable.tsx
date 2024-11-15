import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterMoment} from '@mui/x-date-pickers/AdapterMoment';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import moment, {Moment} from 'moment';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import Button from '~/components/Button';
import {calculateContentHeight} from '~/consts';
import type {Task} from '~/features/tasks/types';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useTable} from '~/hooks/useTable';

import {useTasks} from '../api/useTasks';
import {useTaskStore} from '../store';

import TaskForm, {FormValues} from './TaskForm';

const TaskTable = () => {
  const {shownTasks, setSelectedTask, setShownListTaskIds} = useTaskStore();
  const {station} = useNavigationFunctions();
  const [open, setOpen] = useState<boolean>(false);
  const [rows, setRows] = useState<Array<Partial<Task>>>();
  const {
    getStatus: {data: taskStatus},
    getUsers: {data: taskUsers},
    patch,
  } = useTasks();

  const handleBlurSubmit = useCallback(
    (id: string, ts_id: number, values: any) => {
      const payload = {
        path: `${id}`,
        data: {...values, ts_id: ts_id},
      };
      patch.mutate(payload);
    },
    [patch]
  );

  const onSubmit = (data: FormValues) => {
    rows?.forEach((row) => {
      if (row.id) {
        const submit = {
          path: row.id,
          data: {
            ...data,
            ts_id: row.ts_id,
          },
        };
        patch.mutate(submit, {
          onSuccess: () => {
            setOpen(false);
          },
        });
      }
    });
  };

  const [tableState, reset] = useStatefullTableAtom<Task>('taskTableState');

  const columns = useMemo<MRT_ColumnDef<Task>[]>(
    () =>
      [
        {
          header: 'Dato',
          id: 'due_date',
          accessorFn: (row) => moment(row.due_date),
          sortingFn: (a, b, columnId) => {
            const aM: Moment = a.getValue(columnId);
            const bM: Moment = b.getValue(columnId);
            if (!aM.isValid() && !bM.isValid()) {
              return 0;
            }
            if (!aM.isValid()) {
              return -1;
            }
            if (!bM.isValid()) {
              return 1;
            }

            if (aM.isAfter(bM)) {
              return 1;
            }
            return -1;
          },
          filterVariant: 'datetime-range',
          enableGlobalFilter: false,
          filterFn: () => {},
          muiTableHeadCellProps: {
            sx: {
              '& .MuiBox-root': {
                gridTemplateColumns: '1fr',
              },
            },
          },
          Edit: ({row, cell}) => {
            return (
              <TextField
                type="datetime-local"
                defaultValue={moment(row.original.due_date).format('YYYY-MM-DDTHH:mm')}
                onBlur={(e) => {
                  const key = cell.column.id;
                  handleBlurSubmit(row.original.id, row.original.ts_id, {
                    [key]: moment(e.target.value).toISOString(),
                  });
                }}
              />
            );
          },
          enableEditing: true,
          muiFilterDateTimePickerProps: {
            format: 'YYYY-MM-DDTHH:mm',
            ampm: false,
            ampmInClock: false,
            closeOnSelect: true,
          },
          size: 150,
        },
        {
          accessorKey: 'name',
          header: 'Opgave',
          enableEditing: false,
        },
        {
          accessorKey: 'ts_id',
          header: 'TS_ID',
          size: 30,
          enableEditing: false,
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
        {
          accessorFn: (row) => row.assigned_to,
          id: 'assigned_to',
          header: 'Ansvarlig',
          filterVariant: 'multi-select',
          editVariant: 'select',
          enableGlobalFilter: false,
          editSelectOptions: taskUsers?.map((user) => ({label: user.email, value: user.id})),
          GroupedCell: ({cell, table}) => {
            const filteredRows = table.getFilteredRowModel().rows;
            const value =
              cell.getValue() !== undefined
                ? taskUsers?.find((user) => cell.getValue() === user.id)?.email
                : 'Ikke tildelt';
            return (
              value +
              ' (' +
              filteredRows?.filter(
                (row) =>
                  row.original.assigned_to === cell.getValue() ||
                  (cell.getValue() === undefined && row.original.assigned_to === null)
              ).length +
              ')'
            );
          },
          filterFn: (row, id, filterValue) => {
            if (filterValue.includes('Ikke tildelt')) {
              filterValue = filterValue.concat([null]);
            }
            if (row.original.ts_id === 14373) {
              console.log(row.columnFilters);
            }
            // return filterValue.length > 0
            //   ? filterValue.includes(
            //       taskUsers?.find((user) => user.id === row.getValue(id))?.email
            //     ) ||
            //       (filterValue.includes('Ikke tildelt') && row.original.assigned_to === null)
            //   : true;
            // return (
            //   (row.original.assigned_to === null && filterValue.includes('Ikke tildelt')) ||
            //   (row.columnFilters.assigned_to &&
            //     row.columnFilters.status_id &&
            //     !filterValue.includes('Ikke tildelt')) ||
            //   true
            // );
            return filterValue.length > 0
              ? filterValue.includes('Ikke tildelt') && row.original.assigned_to === null
              : filterValue.includes(taskUsers?.find((user) => user.id === row.getValue(id))?.email)
                ? true
                : true;
            // return (
            //   (row.original.assigned_to === null && filterValue.includes('Ikke tildelt')) ||
            //   row.columnFilters.assigned_to
            // );
          },
        },
        {
          accessorFn: (row) => row.status_id.toString(),
          id: 'status_id',
          header: 'Status',
          enableGlobalFilter: false,
          filterVariant: 'multi-select',
          editVariant: 'select',
          editSelectOptions: taskStatus?.map((status) => ({label: status.name, value: status.id})),
          GroupedCell: ({cell, table}) => {
            const filteredRows = table.getFilteredRowModel().rows;
            return (
              taskStatus?.find((status) => cell.getValue() === status.id.toString())?.name +
              ' (' +
              filteredRows?.filter((row) => row.original.status_id.toString() === cell.getValue())
                .length +
              ')'
            );
          },
          filterFn: (row, id, filterValue) => {
            // console.log(filterValue);
            // console.log(row);
            // const hasLength = filterValue.length > 0;
            // const hasStatus = taskStatus?.find(
            //   (status) => status.id.toString() === row.getValue(id)
            // )?.name;
            // const includesStatus = filterValue.includes(hasStatus);

            // return (
            //   (row.original.assigned_to === null && filterValue.includes('Ikke tildelt')) ||
            //   (row.columnFilters.assigned_to &&
            //     row.columnFilters.status_id &&
            //     !filterValue.includes('Ikke tildelt')) ||
            //   true
            // );
            return filterValue.length > 0 ? filterValue.includes(row.original.status_name) : true;
            // return hasLength ? includesStatus : true;
            // return row.columnFilters.assigned_to && row.columnFilters.status_id;
          },
        },
      ] as MRT_ColumnDef<Task>[],
    [taskStatus, taskUsers, handleBlurSubmit, station]
  );

  const options: Partial<MRT_TableOptions<Task>> = {
    enableFullScreenToggle: true,
    enableFacetedValues: true,
    enableGrouping: true,
    editDisplayMode: 'table',
    enableEditing: true,
    globalFilterFn: 'fuzzy',
    enableColumnDragging: true,
    enableColumnOrdering: true,
    enableMultiRowSelection: true,
    enableRowSelection: true,
    positionToolbarAlertBanner: 'bottom',
    muiTableBodyCellProps: {
      sx: {
        padding: 1,
        '&:focus': {
          outline: '2px solid red',
          outlineOffset: '-2px',
        },
      },
    },
    renderTopToolbarCustomActions: ({table}) => {
      return (
        <Box mr={'auto'} display="flex" gap={2} justifyContent="flex-end">
          <RenderActions
            handleEdit={() => {
              const selectedRows = table.getFilteredSelectedRowModel().rows;
              setOpen(selectedRows.length > 0);
              if (selectedRows.length > 0) {
                setRows(
                  selectedRows.map(
                    (row) => ({id: row.original.id, ts_id: row.original.ts_id}) as Partial<Task>
                  )
                );
                setOpen(true);
              }
            }}
            canEdit={true}
          />
          {/* <Button bttype="primary" sx={{p: 1}} onClick={() => {}} size="large">
            Filter efter status
          </Button>
          <Button bttype="primary" sx={{p: 1}} onClick={() => {}} size="large">
            Filter efter ansvarlig
          </Button>
          <Button bttype="primary" sx={{p: 1}} onClick={() => {}} size="large">
            Filter efter dato
          </Button> */}
        </Box>
      );
    },
    muiDetailPanelProps: {
      sx: {
        backgroundColor: 'grey.100',
      },
    },
    renderDetailPanel: ({row}) => {
      return (
        <Box
          sx={{
            display: 'grid',
            margin: 'auto',
            gridTemplateColumns: '1fr',
            width: '100%',
          }}
        >
          {row.original.loc_id && (
            <Typography>
              <b>Lokationsid</b>: {row.original.loc_id}
            </Typography>
          )}
          {row.original.location_name && (
            <Typography>
              <b>Lokationsnavn</b>: {row.original.location_name}
            </Typography>
          )}
          {row.original.ts_id && (
            <Typography>
              <b>Tidsserie</b>: navn på tidsserie
            </Typography>
          )}
          {row.original.blocks_notifications.length > 0 && (
            <Typography>
              <b>blokerede notifikationer</b>: {row.original.blocks_notifications.join(', ')}
            </Typography>
          )}
          {row.original.description && (
            <Typography>
              <b>beskrivelse</b>: {row.original.description}
            </Typography>
          )}
        </Box>
      );
    },
    muiEditTextFieldProps: ({cell, row}) => ({
      variant: 'outlined',
      onBlur: () => {
        const key = cell.column.id;
        handleBlurSubmit(row.original.id, row.original.ts_id, {[key]: cell.getValue()});
      },
    }),
    muiTableBodyRowProps: (props) => {
      return {
        onClick: () => {
          setSelectedTask(props.row.original.id);
        },
      };
    },
    getFacetedUniqueValues: (table, columnId) => {
      const uniqueValueMap = new Map<string, number>();
      if (columnId === 'status_id') {
        const filter = table.getState().columnFilters;
        const coreRowModel = table.getCoreRowModel().rows;
        taskStatus?.forEach((status) => {
          if (coreRowModel.map((row) => row.original.status_id).includes(status.id))
            uniqueValueMap.set(
              status.name,
              coreRowModel.filter(
                (row) =>
                  row.original.status_id === status.id &&
                  filter.find(
                    (filter) =>
                      filter.id === 'assigned_to' &&
                      ((filter.value as Array<string>).length === 0 ||
                        (filter.value as Array<string>).includes(
                          taskUsers?.find((user) => user.id === row.original.assigned_to)?.email ||
                            'Ikke tildelt'
                        ))
                  ) !== undefined
              ).length
            );
        });
      } else if (columnId === 'assigned_to') {
        const filter = table.getState().columnFilters;
        const coreRowModel = table.getCoreRowModel().rows;
        if (coreRowModel.filter((row) => row.original.assigned_to === null).length > 0)
          uniqueValueMap.set(
            'Ikke tildelt',
            coreRowModel.filter(
              (row) =>
                row.original.assigned_to === null &&
                filter.find(
                  (filter) =>
                    filter.id === 'status_id' &&
                    ((filter.value as Array<string>).length === 0 ||
                      (filter.value as Array<string>).includes(row.original.status_name))
                ) !== undefined
            ).length
          );
        taskUsers?.forEach((user) => {
          if (coreRowModel.map((row) => row.original.assigned_to).includes(user.id))
            uniqueValueMap.set(
              user.email,
              coreRowModel.filter(
                (row) =>
                  row.original.assigned_to === user.id &&
                  filter.find(
                    (filter) =>
                      filter.id === 'status_id' &&
                      ((filter.value as Array<string>).length === 0 ||
                        (filter.value as Array<string>).includes(row.original.status_name))
                  ) !== undefined
              ).length
            );
        });
      }

      return () => uniqueValueMap;
    },
  };

  const table = useTable<Task>(
    columns,
    shownTasks,
    options,
    tableState,
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
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Masse opdatere opgaver</DialogTitle>

        <TaskForm onSubmit={onSubmit}>
          <DialogContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minWidth: 400,
            }}
          >
            <TaskForm.Input
              name="due_date"
              label="Due date"
              type="datetime-local"
              placeholder="Sæt forfaldsdato"
            />
            <TaskForm.AssignedTo />
            <TaskForm.StatusSelect />
          </DialogContent>
          <DialogActions>
            <Button bttype="tertiary" onClick={() => setOpen(false)}>
              Annuller
            </Button>
            <TaskForm.SubmitButton />
          </DialogActions>
        </TaskForm>
      </Dialog>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <MaterialReactTable table={table} />
      </LocalizationProvider>
    </Box>
  );
};

export default TaskTable;
