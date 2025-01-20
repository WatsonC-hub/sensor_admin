import {Edit} from '@mui/icons-material';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  Autocomplete,
  Box,
  Checkbox,
  Stack,
  TextField,
  Typography,
  Button as MuiButton,
  MenuItem,
  ListItemIcon,
  Tooltip,
  IconButton,
} from '@mui/material';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterMoment} from '@mui/x-date-pickers/AdapterMoment';
import {Row, RowData} from '@tanstack/react-table';
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_Row,
  MRT_TableInstance,
  MRT_TableOptions,
  MRT_FilterOption,
} from 'material-react-table';
import moment from 'moment';
import React, {useEffect, useMemo, useState} from 'react';
import {ErrorBoundary, FallbackProps} from 'react-error-boundary';

import Button from '~/components/Button';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {calculateContentHeight} from '~/consts';
import {useTasks} from '~/features/tasks/api/useTasks';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import type {ID, Task, TaskUser} from '~/features/tasks/types';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useTable} from '~/hooks/useTable';
import {authStore} from '~/state/store';

import MassEditDialog from './MassEditDialog';

const NOT_ASSIGNED = 'Ikke tildelt' as const;
const NO_PROJECT = 'Intet projektnummer' as const;

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    rows: Row<TData>;
    foo: string;
    convert?: (value: TValue) => Record<string, TValue>;
  }
}

const isInderminate = (row: MRT_Row<Task>): boolean => {
  const isGrouped = row.groupingColumnId != undefined;
  if (isGrouped && row.subRows) {
    return row.subRows.some((subRow) => isInderminate(subRow));
  }
  return row.getIsSelected();
};

const isChecked = (row: MRT_Row<Task>): boolean => {
  const isGrouped = row.groupingColumnId != undefined;
  if (isGrouped && row.subRows) {
    return row.subRows.every((subRow) => isChecked(subRow));
  }
  return row.getIsSelected();
};

const toggleRowSelection = (row: MRT_Row<Task>, parentChecked = false) => {
  const isGrouped = row.groupingColumnId != undefined;

  const checked = isChecked(row);

  if (isGrouped) {
    row.subRows?.forEach((subRow) => {
      toggleRowSelection(subRow, parentChecked);
    });
  } else {
    if (!parentChecked) {
      if (!checked) {
        row.toggleSelected();
      }
    } else {
      row.toggleSelected();
    }
  }
};

type ViewValues = 'upcoming' | 'my' | 'groupAssigned' | '';

const TaskTable = () => {
  const {mapFilteredTasks, setSelectedTask, setShownListTaskIds, setSelectedLocIds} =
    useTaskStore();
  const {station, taskManagement} = useNavigationFunctions();
  const [open, setOpen] = useState<boolean>(false);
  const [viewValue, setViewValue] = useState<ViewValues>('');
  const {
    getStatus: {data: taskStatus},
    getUsers: {data: taskUsers},
    patch,
  } = useTasks();

  const userAuthId = authStore().user_id;

  const handleBlurSubmit = (id: string, ts_id: number, values: any) => {
    const payload = {
      path: `${id}`,
      data: {...values, ts_id: ts_id},
    };
    patch.mutate(payload);
  };

  const revertView = (table: MRT_TableInstance<Task>) => {
    resetView(table);
    setViewValue('');
  };

  const tableData = useMemo(() => {
    return mapFilteredTasks.map((task) => {
      return {
        ...task,
        assigned_display_name: task.assigned_display_name ?? NOT_ASSIGNED,
        projectno: task.projectno ?? NO_PROJECT,
      };
    });
  }, [mapFilteredTasks]);

  const [tableState, reset] = useStatefullTableAtom<Task>('taskTableState');

  const columns = useMemo<MRT_ColumnDef<Task>[]>(
    () =>
      [
        {
          header: 'Itinerary',
          Header: ({column}) => {
            <Box key={'test'} width={'fit-content'}>
              <Button bttype="primary">test</Button>
              {column.columnDef.header}
            </Box>;
          },
          id: 'itinerary_id',
          accessorFn: (row) => (
            <Box>
              <Tooltip
                arrow
                title={row.itinerary_id !== null ? 'Opgaven er ikke tilknyttet en tur' : ''}
              >
                <div>
                  <IconButton
                    disabled={row.itinerary_id === null}
                    color={'primary'}
                    onClick={() => row.itinerary_id && taskManagement(row.itinerary_id)}
                  >
                    <DriveEtaIcon />
                  </IconButton>
                </div>
              </Tooltip>
            </Box>
          ),
          enableEditing: false,
          enableColumnActions: false,
          enableColumnDragging: false,
          filterSelectOptions: ['Med tur', 'Uden tur'],
          filterVariant: 'select',
          enableColumnFilterModes: false,
          filterFn: (row, columnId, filterValue) => {
            if (filterValue)
              return filterValue === 'Med tur'
                ? row.original.itinerary_id !== null
                : filterValue === 'Uden tur'
                  ? row.original.itinerary_id === null
                  : true;
          },
          size: 20,
        },
        {
          header: 'Dato',
          id: 'due_date',
          accessorFn: (row) => row.due_date,
          sortingFn: (a, b, columnId) => {
            if (a.getValue(columnId) === null || b.getValue(columnId) === null) return 1;
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
            return 1;
          },
          filterVariant: 'date-range',
          enableGlobalFilter: false,
          filterFn: (row, id, filterValue) => {
            if (filterValue) {
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
            }
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
          Cell: ({row, renderedCellValue}) => {
            return (
              <Stack direction={'row'} gap={1} alignItems={'center'}>
                {renderedCellValue}{' '}
                {moment(row.original.due_date).toDate().getTime() < moment().toDate().getTime() &&
                  row.original.status_id !== 3 && (
                    <Tooltip title="Opgavens tidsfrist er overskredet">
                      <ErrorOutlineIcon color="error" />
                    </Tooltip>
                  )}
              </Stack>
            );
          },
          Edit: ({row, cell}) => {
            return (
              <TextField
                type="date"
                size="small"
                defaultValue={row.original.due_date}
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
          size: 200,
        },
        {
          accessorFn: (row) => row.assigned_display_name,
          id: 'assigned_to',
          header: 'Ansvarlig',
          size: 200,
          filterVariant: 'multi-select',
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
                    assigned_display_name: newValue,
                  });
                  queueMicrotask(() => table.setEditingCell(null));
                }}
              />
            );
          },
          editSelectOptions: taskUsers
            ?.map((user) => user.display_name)
            .sort()
            .toSpliced(0, 0, 'Ikke tildelt'),
          renderColumnFilterModeMenuItems: renderArrFilterModeOptions,
          Filter: ({column, table}) => {
            const filters: Array<string | null> = column.getFilterValue() as string[];
            const faceted = column.getFacetedUniqueValues();
            const locale = table.options.localization;

            let helperText = '';
            if (table.getState().columnFilterFns[column.id]) {
              const filterName = 'filter' + capitalize(table.getState().columnFilterFns[column.id]);
              //@ts-expect-error - this is a hack to get the correct locale
              helperText = 'Filtertilstand: ' + locale[filterName];
            }

            return (
              <Autocomplete
                multiple
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                disableCloseOnSelect
                size="small"
                componentsProps={{
                  popper: {style: {width: 'fit-content'}},
                }}
                limitTags={3}
                value={filters ?? []}
                options={
                  taskUsers
                    ?.map((user) => user.display_name)
                    .sort()
                    .toSpliced(0, 0, 'Ikke tildelt') ?? []
                }
                getOptionLabel={(option) => {
                  if (option != null) {
                    if (faceted.has(option)) {
                      return option + ' (' + faceted.get(option) + ')';
                    } else {
                      return option + ' (0)';
                    }
                  }

                  return option ?? '';
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={'Filtrér efter ' + column.columnDef.header}
                    variant="outlined"
                    helperText={helperText}
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
          // enableColumnFilterModes: true,
          renderColumnFilterModeMenuItems: renderArrFilterModeOptions,
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
                renderInput={(params) => <TextField {...params} variant="outlined" />}
                onChange={(e, newValue) => {
                  handleBlurSubmit(row.original.id, row.original.ts_id, {
                    status_id: taskStatus?.find((status) => status.name === newValue)?.id,
                    status_category: taskStatus?.find((status) => status.name === newValue)
                      ?.category,
                    status_name: newValue,
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
          renderColumnFilterModeMenuItems: renderArrFilterModeOptions,
          Filter: ({column, table}) => {
            const filters: Array<string | null> = column.getFilterValue() as string[];
            const faceted = column.getFacetedUniqueValues();
            const locale = table.options.localization;
            let helperText = '';
            if (table.getState().columnFilterFns[column.id]) {
              const filterName = 'filter' + capitalize(table.getState().columnFilterFns[column.id]);
              //@ts-expect-error - this is a hack to get the correct locale
              helperText = 'Filtertilstand: ' + locale[filterName];
            }

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
                options={Array.from(faceted.keys()).sort().reverse() ?? []}
                getOptionLabel={(option) => {
                  if (option != null) {
                    if (faceted.has(option)) {
                      return option + ' (' + faceted.get(option) + ')';
                    } else {
                      return option + ' (0)';
                    }
                  }

                  return 'Intet projektnummer' + ' (0)';
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={'Filtrér efter ' + column.columnDef.header}
                    variant="outlined"
                    helperText={helperText}
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
          accessorKey: 'loc_id',
          header: 'Loc_ID',
          visibleInShowHideMenu: false,
          filterFn: 'equals',
          size: 150,
          enableEditing: false,
        },
      ] as MRT_ColumnDef<Task>[],
    [taskStatus, taskUsers]
  );

  const options: Partial<MRT_TableOptions<Task>> = useMemo(
    () => ({
      defaultColumn: {
        grow: 1,
        minSize: 150,
        size: 250,
      },
      defaultDisplayColumn: {
        minSize: 50,
      },
      enableColumnFilterModes: true,
      enableFullScreenToggle: true,
      enableFacetedValues: true,
      enableGrouping: true,
      editDisplayMode: 'cell',
      enableEditing: true,
      enableRowDragging: false,
      globalFilterFn: 'fuzzy',
      // filterFns: {
      //   arrIncludesNone: (row, id, filterValue) => {
      //     return filterValue && !filterValue.some((val: any) => row.getValue(id) === val);
      //   },
      // },
      localization: {
        filterArrIncludesNone: 'Indeholder ikke',
      } as any,
      enableColumnDragging: true,
      enableColumnOrdering: true,
      enableSorting: true,
      enableColumnResizing: true,
      // autoResetPageIndex: false,
      enableRowSelection: true,
      groupedColumnMode: 'remove',
      // enableExpanding: true,
      positionExpandColumn: 'first',
      enablePagination: false,
      enableRowVirtualization: true,
      // enableRowPinning: true,
      // keepPinnedRows: false,
      // paginateExpandedRows: false,
      getRowId: (row) => row.id,
      muiTableBodyCellProps: ({cell, table}) => ({
        onClick: () => {
          table.setEditingCell(cell);
        },
      }),
      renderToolbarInternalActions: ({table}) => {
        return <RenderInternalActions table={table} reset={reset} />;
      },
      muiExpandButtonProps: ({row}) => ({
        onClick: () => {
          row.toggleExpanded(!row.getIsExpanded());

          // row.getIsGrouped() && row.pin(row.getIsExpanded() ? false : 'top');
        },
      }),
      displayColumnDefOptions: {
        'mrt-row-select': {
          Cell: ({row}) => {
            const checked = isChecked(row);

            const indeterminate = isInderminate(row);

            return (
              <Checkbox
                checked={checked}
                indeterminate={checked ? false : indeterminate}
                onChange={() => {
                  toggleRowSelection(row, checked);
                }}
              />
            );
          },
          size: 50,
        },
        'mrt-row-expand': {
          size: 200,
          enableResizing: false,

          muiTableBodyCellProps: {
            sx: {
              whiteSpace: 'normal',
            },
          },
        },
      },
      renderTopToolbarCustomActions: ({table}) => {
        return (
          <Box width="60%" display="flex" flexDirection={'row'} gap={2} alignItems={'center'}>
            <Button
              bttype="primary"
              onClick={() => {
                const selectedRows = table.getFilteredSelectedRowModel().rows;
                setOpen(selectedRows.length > 0);
              }}
              endIcon={<Edit />}
              disabled={table.getFilteredSelectedRowModel().rows.length === 0}
            >
              Rediger
            </Button>

            <TextField
              select
              size="small"
              sx={{width: 200}}
              value={viewValue}
              label="View"
              onChange={(e) => {
                const value = e.target.value as ViewValues;
                setViewValue(value);
                onSelectChange(value, table, taskUsers, userAuthId?.toString());
              }}
            >
              {/* <MenuItem value={'-1'}>Vælg filtrering...</MenuItem> */}
              <MenuItem value={'upcoming'}>Kommende opgaver</MenuItem>
              <MenuItem value={'my'}>Se Mine opgaver</MenuItem>
              <MenuItem value={'groupAssigned'}>Gruppér efter tildelte</MenuItem>
            </TextField>
            <Button bttype="tertiary" onClick={() => revertView(table)}>
              Nulstil view
            </Button>
          </Box>
        );
      },
      muiDetailPanelProps: {
        sx: {
          backgroundColor: 'grey.100',
        },
      },
      renderToolbarAlertBannerContent: ({table, groupedAlert}) => {
        const selected = table.getSelectedRowModel();
        const isgrouped = table.getState().grouping.length > 0;
        const numSelected = selected.rows.length;
        const total = table.getFilteredRowModel().rows.length;
        return (
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              px: 1,
            }}
          >
            {isgrouped ? groupedAlert : <div />}
            {numSelected > 0 && (
              <Stack direction={'row'} alignItems="center" gap={1}>
                <Typography>
                  {numSelected} af {total} rækker valgt
                </Typography>
                <MuiButton
                  size="small"
                  onClick={() => {
                    table.resetRowSelection(true);
                  }}
                >
                  Ryd valg
                </MuiButton>
              </Stack>
            )}
          </Box>
        );
      },
      // renderDetailPanel: ({row}) => {
      //   return (
      //     <Box
      //       sx={{
      //         display: 'grid',
      //         margin: 'auto',
      //         gridTemplateColumns: '1fr',
      //         width: '100%',
      //       }}
      //     >
      //       {row.original.loc_id && (
      //         <Typography>
      //           <b>Lokationsid</b>: {row.original.loc_id}
      //         </Typography>
      //       )}
      //       {row.original.location_name && (
      //         <Typography>
      //           <b>Lokationsnavn</b>: {row.original.location_name}
      //         </Typography>
      //       )}
      //       {row.original.blocks_notifications.length > 0 && (
      //         <Typography>
      //           <b>blokerede notifikationer</b>: {row.original.blocks_notifications.join(', ')}
      //         </Typography>
      //       )}
      //       {row.original.description && (
      //         <Typography>
      //           <b>beskrivelse</b>: {row.original.description}
      //         </Typography>
      //       )}
      //     </Box>
      //   );
      // },
      muiFilterTextFieldProps: {
        size: 'small',
        variant: 'outlined',
        // InputProps: {
        //   endAdornment: (
        //     <Tooltip title="Ryd filter">
        //       <IconButton
        //         sx={{mr: 1}}
        //         size="small"
        //         onClick={() => {
        //           column.setFilterValue('');
        //         }}
        //       >
        //         <Close fontSize="small" />
        //       </IconButton>
        //     </Tooltip>
        //   ),
        // },
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
      muiTableBodyRowProps: ({row}) => {
        return {
          sx: {
            backgroundColor: row.original.status_id === 3 ? 'grey.200' : 'inherit',
            // backgroundColor: row.original.itinerary_id ? 'grey' : 'inherit',
          },
          onClick: () => {
            setSelectedTask(row.original.id);
          },
        };
      },
    }),
    [handleBlurSubmit, setSelectedTask, station, taskUsers, reset, userAuthId]
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
    const ids = table.getFilteredRowModel().rows.map((row) => row.original.id);
    const origIds = tableData.map((task) => task.id);

    const areSetsEqual = (a: Set<ID>, b: Set<ID>) =>
      a.size === b.size && [...a].every((value) => b.has(value));

    if (areSetsEqual(new Set(ids), new Set(origIds))) {
      setShownListTaskIds([]);
      return;
    }

    setShownListTaskIds(ids);
  }, [table.getState().globalFilter, table.getState().columnFilters]);

  useEffect(() => {
    setSelectedLocIds([
      ...new Set(table.getFilteredSelectedRowModel().rows.map((row) => row.original.loc_id)),
    ]);
  }, [table.getState().rowSelection]);

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
      <MassEditDialog open={open} setOpen={setOpen} table={table} />
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
  return (
    <>
      <Typography variant="h4" component="h1" sx={{textAlign: 'center', mt: 5}}>
        {error.message}
      </Typography>
      <Button bttype="primary" onClick={resetErrorBoundary}>
        Prøv igen
      </Button>
    </>
  );
};

const resetView = (table: MRT_TableInstance<Task>) => {
  table.resetGlobalFilter();
  table.resetGrouping();
  table.resetSorting();
  table.setColumnFilterFns((prev) => {
    return {
      ...prev,
      status_id: 'arrIncludesNone',
    };
  });
  table.setColumnFilters([
    {
      id: 'status_id',
      value: ['Færdiggjort'],
    },
  ]);
};

const onSelectChange = (
  selectValue: ViewValues | '-1',
  table: MRT_TableInstance<Task>,
  taskUsers: Array<TaskUser> | undefined,
  userAuthId: string | undefined
) => {
  resetView(table);
  switch (selectValue) {
    case 'upcoming':
      showUpcomingTasks(table);
      break;
    case 'my':
      showMyTasks(table, taskUsers, userAuthId);
      break;
    case 'groupAssigned':
      groupByAssigned(table);
      break;
    default:
      break;
  }
};

const showUpcomingTasks = (table: MRT_TableInstance<Task>) => {
  table.setShowColumnFilters(true);

  table.setColumnFilters([
    {
      id: 'assigned_to',
      value: ['Ikke tildelt'],
    },
    {
      id: 'status_id',
      value: ['Åbent'],
    },
  ]);
};

const showMyTasks = (
  table: MRT_TableInstance<Task>,
  taskUsers: Array<TaskUser> | undefined,
  userAuthId: string | undefined
) => {
  table.setShowColumnFilters(true);
  table.setColumnFilters([
    {
      id: 'assigned_to',
      value: [taskUsers?.find((user) => user.id === userAuthId)?.display_name],
    },
  ]);
  table.setSorting([
    {
      id: 'due_date',
      desc: false,
    },
  ]);
};

const groupByAssigned = (table: MRT_TableInstance<Task>) => {
  // table.setShowColumnFilters(true);
  table.setGrouping(['assigned_to']);
  table.setSorting([
    {id: 'assigned_to', desc: false},
    {id: 'due_date', desc: false},
  ]);
};

const errorReset = (details: object, reset: () => void) => {
  reset();
};

interface FilterModeOptions {
  onSelectFilterMode: (mode: MRT_FilterOption) => void;
}

const renderArrFilterModeOptions = ({onSelectFilterMode}: FilterModeOptions) => [
  <MenuItem
    key="arrIncludesSome"
    onClick={() => {
      onSelectFilterMode('arrIncludesSome');
    }}
  >
    <ListItemIcon>*</ListItemIcon>
    Indeholder
  </MenuItem>,
  <MenuItem
    key="arrIncludesNone"
    onClick={() => {
      onSelectFilterMode('arrIncludesNone');
    }}
  >
    <ListItemIcon>!*</ListItemIcon>
    Indeholder ikke
  </MenuItem>,
];

function capitalize(s: string) {
  return String(s[0]).toUpperCase() + String(s).slice(1);
}

export default TaskTable;
