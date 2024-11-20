import {
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
import {Row, RowData} from '@tanstack/react-table';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import moment from 'moment';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
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

  const [tableState] = useStatefullTableAtom<Task>('taskTableState');

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
                  value={filters[rangeFilterIndex] ?? ''}
                  onChange={(e) => {
                    column.setFilterValue((prev: Array<string | null>) => {
                      console.log('prev', prev);
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
          size: 200,
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
          filterVariant: 'multi-select',
          editVariant: 'select',
          meta: {
            convert: (value) => {
              return {
                assigned_to: taskUsers?.find((user) => user.display_name === value)?.id ?? null,
              };
            },
          },
          editSelectOptions: () => taskUsers?.map((user) => user.display_name),
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
    positionToolbarAlertBanner: 'top',
    groupedColumnMode: 'remove',
    enableColumnResizing: true,
    positionExpandColumn: 'first',
    muiTableBodyCellProps: {
      sx: {
        padding: 1,
        '&:focus': {
          outline: '2px solid red',
          outlineOffset: '-2px',
        },
      },
    },
    displayColumnDefOptions: {
      'mrt-row-expand': {
        GroupedCell: ({row, table}) => {
          console.log(table.getState());
          const grouping = table.getState().grouping;
          console.log(grouping);
          return grouping && grouping.length > 0
            ? row.getValue(grouping[grouping.length - 1])
            : undefined;
        },
        enableResizing: true,
        muiTableBodyCellProps: ({row}) => ({
          sx: (theme) => ({
            color:
              row.depth === 0
                ? theme.palette.primary.main
                : row.depth === 1
                  ? theme.palette.secondary.main
                  : undefined,
          }),
        }),
        size:
          tableState?.state?.grouping?.length && tableState?.state?.grouping?.length > 0
            ? 200
            : 100,
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
    muiEditTextFieldProps: ({cell, row, column}) => ({
      variant: 'outlined',
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
  };
  console.log('tableState', tableState);
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
              <TaskForm.Input
                name="due_date"
                label="Due date"
                type="datetime-local"
                placeholder="Sæt forfaldsdato"
                disabled={dueDateChecked}
              />
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
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default TaskTable;