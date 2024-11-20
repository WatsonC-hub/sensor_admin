import {
  Autocomplete,
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterMoment} from '@mui/x-date-pickers/AdapterMoment';
import {Row, RowData} from '@tanstack/react-table';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import moment from 'moment';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ErrorBoundary, FallbackProps} from 'react-error-boundary';
import {UseFormReturn} from 'react-hook-form';

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

const NOT_ASSIGNED = 'Ikke tildelt' as const;

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    rows: Row<TData>;
    foo: string;
    convert?: (value: TValue) => Record<string, TValue>;
  }
}

const TaskTable = () => {
  const [dueDateChecked, setDueDateChecked] = useState<boolean>(false);
  const [assignedChecked, setAssignedChecked] = useState<boolean>(false);
  const [statusChecked, setStatusChecked] = useState<boolean>(false);
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

  const onSubmit = (data: FormValues, formMethods?: UseFormReturn<FormValues>) => {
    if (formMethods) {
      let patchData = {};
      if (!dueDateChecked && data.due_date) patchData = {due_date: data.due_date};
      else if (dueDateChecked) {
        patchData = {...patchData, due_date: null};
        setDueDateChecked(!dueDateChecked);
      }
      if (!assignedChecked && data.assigned_to)
        patchData = {...patchData, assigned_to: data.assigned_to};
      else if (assignedChecked) {
        patchData = {...patchData, assigned_to: null};
        setAssignedChecked(!assignedChecked);
      }
      if (!statusChecked && data.status_id) patchData = {...patchData, status_id: data.status_id};
      else if (statusChecked) {
        patchData = {...patchData, status_id: 1};
        setStatusChecked(!statusChecked);
      }

      if (Object.keys(patchData).length > 0)
        rows?.forEach((row) => {
          if (row.id) {
            const submit = {
              path: row.id,
              data: {
                ...patchData,
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
    }
  };

  const tableData = useMemo(() => {
    return shownTasks.map((task) => {
      return {
        ...task,
        assigned_display_name: task.assigned_display_name ?? NOT_ASSIGNED,
      };
    });
  }, [shownTasks]);

  const [tableState, reset] = useStatefullTableAtom<Task>('taskTableState');

  const columns = useMemo<MRT_ColumnDef<Task>[]>(
    () =>
      [
        {
          header: 'Dato',
          id: 'due_date',
          accessorFn: (row) => row.due_date,
          sortingFn: (a, b, columnId) => {
            const aM = moment(a.getValue(columnId));
            const bM = moment(b.getValue(columnId));
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
          filterVariant: 'date-range',
          enableGlobalFilter: false,
          filterFn: (row, id, filterValue) => {
            const date = moment(row.getValue(id));
            const startFilterDate = filterValue[0] ? moment(filterValue[0]) : null;
            const endFilterDate = filterValue[1] ? moment(filterValue[1]) : null;

            const filterNotSet = startFilterDate === null && endFilterDate === null;
            if (filterNotSet) return true;

            if (startFilterDate !== null && endFilterDate === null) {
              return date.isAfter(startFilterDate);
            }

            if (startFilterDate === null && endFilterDate !== null) {
              return date.isBefore(endFilterDate);
            }

            return date.isAfter(startFilterDate) && date.isBefore(endFilterDate);
          },
          Filter: ({column, rangeFilterIndex}) => {
            const filters: Array<string | null> = column.getFilterValue() as string[];
            return (
              filters &&
              filters.length > 0 &&
              rangeFilterIndex != undefined && (
                <TextField
                  type="date"
                  size="small"
                  value={filters[rangeFilterIndex] ?? ''}
                  onChange={(e) => {
                    column.setFilterValue((prev: Array<string | null>) => {
                      const update = [...prev];
                      update[rangeFilterIndex] = e.target.value == '' ? null : e.target.value;
                      return update;
                    });
                  }}
                />
              )
            );
          },
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
                type="date"
                size="small"
                defaultValue={row.original.due_date ?? ''}
                onBlur={(e) => {
                  const key = cell.column.id;
                  handleBlurSubmit(row.original.id, row.original.ts_id, {
                    [key]: e.target.value,
                  });
                }}
              />
            );
          },
          enableEditing: true,
          muiFilterDatePickerProps: {
            format: 'YYYY-MM-DD',
            closeOnSelect: true,
          },
          size: 175,
        },
        {
          accessorKey: 'name',
          header: 'Opgave',
          enableEditing: false,
          enableGrouping: false,
          enableColumnFilter: false,
          size: 200,
        },
        {
          accessorKey: 'location_name',
          header: 'Lokation',
          enableEditing: false,
        },
        {
          accessorKey: 'tstype_name',
          header: 'Tidsserietype',
          enableEditing: false,
          filterVariant: 'multi-select',
        },
        {
          accessorKey: 'loctypename',
          header: 'Lokationstype',
          enableEditing: false,
          filterVariant: 'multi-select',
        },
        {
          accessorKey: 'projectno',
          header: 'Projektnummer',
          enableEditing: false,
          filterVariant: 'multi-select',
        },
        {
          accessorKey: 'ts_id',
          header: 'TS_ID',
          size: 150,
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
          accessorFn: (row) => row.assigned_display_name,
          id: 'assigned_to',
          header: 'Ansvarlig',
          size: 200,
          filterVariant: 'autocomplete',
          // editVariant: 'select',
          filterFn: 'arrIncludesSome',
          Edit: ({row, cell, table}) => {
            return (
              <Autocomplete
                fullWidth
                selectOnFocus
                blurOnSelect
                handleHomeEndKeys
                disableClearable
                size="small"
                value={row.original.assigned_display_name ?? NOT_ASSIGNED}
                options={
                  taskUsers
                    ?.map((user) => user.display_name)
                    .sort()
                    .toSpliced(0, 0, NOT_ASSIGNED) ?? []
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={'Filtrér efter ' + cell.column.columnDef.header}
                    variant="outlined"
                  />
                )}
                onChange={(e, newValue) => {
                  handleBlurSubmit(row.original.id, row.original.ts_id, {
                    assigned_to:
                      taskUsers?.find((user) => user.display_name === newValue)?.id ?? null,
                  });
                  table.setEditingCell(null);
                }}
              />
            );
          },
          editSelectOptions: taskUsers
            ?.map((user) => user.display_name)
            .sort()
            .toSpliced(0, 0, 'Ikke tildelt'),
          Filter: ({column}) => {
            const filters: Array<string | null> = column.getFilterValue() as string[];

            return (
              <Autocomplete
                multiple
                fullWidth
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                disableCloseOnSelect
                size="small"
                limitTags={3}
                value={filters ?? []}
                options={
                  taskUsers
                    ?.map((user) => user.display_name)
                    .sort()
                    .toSpliced(0, 0, 'Ikke tildelt') ?? []
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={'Filtrér efter ' + column.columnDef.header}
                    variant="outlined"
                  />
                )}
                onChange={(e, newValue) => {
                  column.setFilterValue(() => {
                    return newValue;
                  });
                }}
              />
            );
          },
          meta: {
            convert: (value) => {
              return {
                assigned_to: taskUsers?.find((user) => user.display_name === value)?.id ?? null,
              };
            },
          },
          enableGlobalFilter: false,
        },
        {
          accessorFn: (row) => row.status_name,
          id: 'status_id',
          header: 'Status',
          size: 200,
          enableGlobalFilter: false,
          filterVariant: 'multi-select',
          editVariant: 'select',
          Edit: ({row, table}) => {
            return (
              <Autocomplete
                fullWidth
                selectOnFocus
                blurOnSelect
                handleHomeEndKeys
                disableClearable
                size="small"
                value={row.original.status_name}
                options={taskStatus?.map((status) => status.name) ?? []}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    // placeholder={'Filtrér efter ' + cell.column.columnDef.header}
                    variant="outlined"
                  />
                )}
                onChange={(e, newValue) => {
                  handleBlurSubmit(row.original.id, row.original.ts_id, {
                    status_id: taskStatus?.find((status) => status.name === newValue)?.id,
                  });
                  queueMicrotask(() => table.setEditingCell(null));
                }}
              />
            );
          },
          meta: {
            convert: (value) => ({
              status_id: taskStatus?.find((status) => status.name === value)?.id,
            }),
          },
          editSelectOptions: taskStatus?.map((status) => status.name),
        },
      ] as MRT_ColumnDef<Task>[],
    [taskStatus, taskUsers, handleBlurSubmit, station]
  );

  const options: Partial<MRT_TableOptions<Task>> = useMemo(
    () => ({
      enableFullScreenToggle: true,
      enableFacetedValues: true,
      enableGrouping: true,
      editDisplayMode: 'cell',
      enableEditing: true,
      globalFilterFn: 'fuzzy',
      enableColumnDragging: true,
      enableColumnOrdering: true,
      enableMultiRowSelection: true,
      enableSorting: true,
      autoResetPageIndex: false,
      enableRowSelection: true,
      groupedColumnMode: 'remove',
      enableColumnResizing: true,
      enableExpanding: true,
      positionExpandColumn: 'first',
      enablePagination: false,
      getRowId: (row) => row.id,
      muiTableBodyCellProps: ({cell, table}) => ({
        onClick: () => {
          table.setEditingCell(cell); //set editing cell
          //optionally, focus the text field
        },
      }),
      displayColumnDefOptions: {
        'mrt-row-expand': {
          GroupedCell: ({row, table}) => {
            const grouping = table.getState().grouping;
            return grouping.length > 0 ? row.getValue(grouping[grouping.length - 1]) : undefined;
          },
          enableResizing: true,
          muiTableBodyCellProps: ({row, table}) => {
            const isTsId =
              row.groupingColumnId === 'ts_id' &&
              table.getState().grouping.length > 0 &&
              table.getState().grouping[table.getState().grouping.length - 1] === 'ts_id';

            return {
              onClick: isTsId
                ? () => {
                    station(undefined, row.original.ts_id);
                  }
                : undefined,
              sx: (theme) => ({
                cursor: isTsId ? 'pointer' : undefined,
                textDecoration: isTsId ? 'underline' : undefined,
                color:
                  row.depth === 0
                    ? theme.palette.primary.main
                    : row.depth === 1
                      ? theme.palette.secondary.main
                      : undefined,
              }),
            };
          },
          size: 200,
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
      muiEditTextFieldProps: ({cell, row, column}) => ({
        variant: 'outlined',
        SelectProps: {
          defaultOpen: true,
          MenuProps: {
            disablePortal: true,
          },
        },
        onBlur: () => {
          const key = cell.column.id;
          const meta = column.columnDef.meta;
          if (meta?.convert) {
            handleBlurSubmit(row.original.id, row.original.ts_id, meta.convert(row.getValue(key)));
          } else {
            handleBlurSubmit(row.original.id, row.original.ts_id, {[key]: cell.getValue()});
          }
        },
      }),
      muiTableBodyRowProps: (props) => {
        return {
          onClick: () => {
            setSelectedTask(props.row.original.id);
          },
        };
      },
    }),
    [handleBlurSubmit, setSelectedTask, station]
  );

  const table = useTable<Task>(
    columns,
    tableData,
    options,
    tableState,
    TableTypes.TABLE,
    MergeType.RECURSIVEMERGE
  );

  useEffect(() => {
    const globalFilter = table.getState().globalFilter;
    if (globalFilter === '' || globalFilter === undefined || globalFilter === null) {
      setShownListTaskIds([]);
      return;
    }
    const ids = table.getFilteredRowModel().rows.map((row) => row.original.id);
    setShownListTaskIds(ids);
  }, [table.getState().globalFilter]);

  console.log('RERENDERING');

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

        <TaskForm
          onSubmit={onSubmit}
          defaultValues={{
            assigned_to: null,
            due_date: null,
            status_id: undefined,
          }}
        >
          <DialogContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minWidth: 400,
            }}
          >
            <Box display={'flex'} flexDirection={'row'}>
              <Tooltip title="Fjern dato fra valgte opgaver">
                <FormControlLabel
                  label=""
                  control={
                    <Checkbox
                      checked={dueDateChecked}
                      onChange={() => setDueDateChecked(!dueDateChecked)}
                    />
                  }
                />
              </Tooltip>
              <TaskForm.DueDate disabled={dueDateChecked} />
            </Box>
            <Box display={'flex'} flexDirection={'row'}>
              <Tooltip title="Fjern tildelt fra valgte opgaver">
                <FormControlLabel
                  label=""
                  control={
                    <Checkbox
                      checked={assignedChecked}
                      onChange={() => setAssignedChecked(!assignedChecked)}
                    />
                  }
                />
              </Tooltip>
              <TaskForm.AssignedTo disabled={assignedChecked} />
            </Box>
            <Box display={'flex'} flexDirection={'row'}>
              <Tooltip title="Nulstil status fra valgte opgaver">
                <FormControlLabel
                  label=""
                  control={
                    <Checkbox
                      checked={statusChecked}
                      onChange={() => setStatusChecked(!statusChecked)}
                    />
                  }
                />
              </Tooltip>
              <TaskForm.StatusSelect disabled={statusChecked} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button bttype="tertiary" onClick={() => setOpen(false)}>
              Annuller
            </Button>
            <TaskForm.SubmitButton />
          </DialogActions>
        </TaskForm>
      </Dialog>
      <ErrorBoundary
        FallbackComponent={errorFallback}
        onReset={(details) => errorReset(details, reset)}
        onError={(error) => console.log(error)}
      >
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <MaterialReactTable table={table} />
        </LocalizationProvider>
      </ErrorBoundary>
    </Box>
  );
};

const errorFallback = ({error, resetErrorBoundary}: FallbackProps) => {
  resetErrorBoundary(error);
  console.log(error);
  return (
    <>
      <Typography variant="h4" component="h1" sx={{textAlign: 'center', mt: 5}}>
        {error.message}
      </Typography>
    </>
  );
};

const errorReset = (details: object, reset: () => void) => {
  reset();
  console.log(details);
};
export default TaskTable;
