// A hook that returns whether the current screen size is mobile, tablet or desktop.
import {UseQueryResult} from '@tanstack/react-query';
import {merge, assign} from 'lodash';
import {
  type MRT_RowData,
  type MRT_TableOptions,
  type MRT_ColumnDef,
  useMaterialReactTable,
  type MRT_TableInstance,
  MRT_TableState,
} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';
import {useMemo, useState} from 'react';

import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';
import {APIError} from '~/queryClient';

const getOptions = <TData extends MRT_RowData>(
  breakpoints: ReturnType<typeof useBreakpoints>,
  type: string
) => {
  const globalOptions: Partial<MRT_TableOptions<TData>> = {
    localization: MRT_Localization_DA,
    autoResetPageIndex: false,
    enablePagination: true,
    globalFilterFn: 'fuzzy',
    enableStickyFooter: true,
    renderToolbarInternalActions: ({table}) => {
      return RenderInternalActions({table});
    },
    positionExpandColumn: 'last',
    muiPaginationProps: {
      size: 'small',
      showRowsPerPage: false,
      color: 'primary',
      shape: 'rounded',
      variant: 'outlined',
    },
    muiSkeletonProps: {
      animation: 'wave',
    },
    paginationDisplayMode: 'pages',
    muiTablePaperProps: ({table}) => ({
      style: {
        zIndex: table.getState().isFullScreen ? 1200 : undefined,
      },
      sx: {
        width: '100%',
        flex: '1 1 0',
        display: 'flex',
        flexFlow: 'column',
        zIndex: 0,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'grey.300',
        borderStyle: 'solid',
      },
    }),
    muiSearchTextFieldProps: {
      sx: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '9999px',
        },
      },
    },
    displayColumnDefOptions: {
      'mrt-row-expand': {
        header: '',
        size: 10,
        muiTableHeadCellProps: {
          sx: {
            padding: 0,
          },
        },
      },
    },
    muiTableContainerProps: {
      sx: {
        flex: '1 1 0',
        height: 'inherit',
      },
    },
    muiBottomToolbarProps: {
      sx: {
        boxShadow: 'none',
      },
    },
  };

  const mobileListOptions: Partial<MRT_TableOptions<TData>> = assign({}, globalOptions, {
    enableTableFooter: false,
    enableTableHead: false,
    enableTopToolbar: false,
    enableExpandAll: false,
    enableExpanding: false,
    enableColumnActions: false,
    muiTableBodyCellProps: {
      sx: {
        borderRadius: 9999,
        border: 'none',
        backgroundColor: 'grey.300',
        alignContent: 'space-between',
      },
    },
    muiTableContainerProps: undefined,
    muiTablePaperProps: {
      sx: {
        // width: '100%',
        // flex: '1 1 0',
        // display: 'flex',
        // flexFlow: 'column',
        boxShadow: breakpoints.isMobile ? 'none' : '1',
      },
    },
    muiTableBodyRowProps: ({row}) => {
      // The following styling is neccessary to make sure the detail panel look as a part of the row. The purpose of the styling is to shift the detail panel upwards so that it aligns with the row.
      return {
        sx: {
          display: 'table-row !important',
          border: 'none',
          backgroundColor: 'grey.300',
          background: 'grey.300',
          mt: -7.7,
          px: 2,
          mx: -2,
          transition: 'transform 0.2s',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          borderBottomLeftRadius: '15px',
          borderBottomRightRadius: '15px',
          userSelect: 'text',
        },
        onClick: () => {
          row.toggleExpanded(!row.getIsExpanded());
        },
      };
    },
    muiTableProps: {
      sx: {
        borderSpacing: 5,
        border: 'none',
      },
    },

    initialState: {
      density: 'compact',
      columnVisibility: {
        'mrt-row-expand': false,
      },
    },
    muiDetailPanelProps: {
      sx: {
        border: 'none',
        borderBottomLeftRadius: '15px',
        borderBottomRightRadius: '15px',
      },
    },
    // muiExpandButtonProps: ({row}) => ({
    //   sx: {
    //     transform: row.getIsExpanded() ? 'rotate(180deg)' : 'rotate(-90deg)',
    //     transition: 'transform 0.2s',
    //   },
    // }),
  } as Partial<MRT_TableOptions<TData>>);

  const desktopOptions: Partial<MRT_TableOptions<TData>> = merge({}, globalOptions, {
    ...globalOptions,
    enableTableFooter: true,
    enableStickyHeader: true,
    enableGlobalFilterRankedResults: true,
    positionGlobalFilter: 'left',
    enableColumnActions: breakpoints.isTouch ? false : true,
    enableTableHead: true,
    enableFilter: false,
    displayColumnDefOptions: {
      'mrt-row-actions': {
        size: 100, //if using layoutMode that is not 'semantic', the columns will not auto-size, so you need to set the size manually
        grow: false,
        muiTableHeadCellProps: {
          align: 'right',
        },
        muiTableBodyCellProps: {
          align: 'right',
        },
      },
    },
    initialState: {
      showGlobalFilter: true,
      density: 'comfortable',
    },
    positionActionsColumn: 'last',
    muiSearchTextFieldProps: {
      variant: 'outlined',
      size: 'small',
    },
  } as Partial<MRT_TableOptions<TData>>);

  if (breakpoints.isMobile && type === TableTypes.LIST) {
    return mobileListOptions;
  }

  // if (breakpoints.isMobile && type === TableTypes.TABLE) {
  //   return globalOptions;
  // }

  return desktopOptions;
};

const excludeColumnFilterFnsOnFirst = <TData extends MRT_RowData>(
  state: Partial<MRT_TableState<TData>> | undefined,
  isFirstRender: boolean
) => {
  if (isFirstRender) {
    if (state?.columnFilterFns) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {columnFilterFns, ...rest} = state;
      return rest;
    }
  }
  return state;
};

export const useTable = <TData extends MRT_RowData>(
  columns: MRT_ColumnDef<TData>[],
  data: TData[] | undefined | null,
  options: Partial<MRT_TableOptions<TData>>,
  state: Partial<MRT_TableOptions<TData>> | undefined,
  type: string = TableTypes.LIST,
  merge_method: string | undefined = MergeType.RECURSIVEMERGE
): MRT_TableInstance<TData> => {
  const breakpoints = useBreakpoints();
  const [isFirstRender, setIsFirstRender] = useState(true);

  let tableOptions: Partial<MRT_TableOptions<TData>> = options;
  if (merge_method === MergeType.SHALLOWMERGE)
    tableOptions = assign({}, getOptions<TData>(breakpoints, type), options);
  else if (merge_method === MergeType.RECURSIVEMERGE)
    tableOptions = merge({}, getOptions<TData>(breakpoints, type), options);

  const tableState = excludeColumnFilterFnsOnFirst(state?.state, isFirstRender);

  const table = useMaterialReactTable({
    columns,
    data: data ?? [],
    ...tableOptions,
    ...state,
    state: {
      ...tableState,
      isLoading: data === undefined,
      showSkeletons: data === undefined,
    },
  });

  if (isFirstRender) {
    // Sets the columnFilterFns on the first render to avoid a bug with the columnFilterFns not being set correctly
    table.setColumnFilterFns((prev) => ({
      ...prev,
      ...(state?.state?.columnFilterFns ?? {}),
    }));
    setIsFirstRender(false);
  }

  return table;
};

export const useQueryTable = <TData extends MRT_RowData>(
  columns: MRT_ColumnDef<TData>[],
  queryResult: UseQueryResult<TData[], APIError>,
  options: Partial<MRT_TableOptions<TData>>,
  state: Partial<MRT_TableOptions<TData>> | undefined,
  type: string = TableTypes.LIST,
  merge_method: string | undefined = MergeType.RECURSIVEMERGE
): MRT_TableInstance<TData> => {
  const breakpoints = useBreakpoints();
  const [isFirstRender, setIsFirstRender] = useState(true);

  const {data, isFetched, error} = queryResult;

  const tableOptions = useMemo(() => {
    let localtableOptions: Partial<MRT_TableOptions<TData>> = {...options};
    if (merge_method === MergeType.SHALLOWMERGE)
      localtableOptions = assign({}, getOptions<TData>(breakpoints, type), options);
    else if (merge_method === MergeType.RECURSIVEMERGE)
      localtableOptions = merge({}, getOptions<TData>(breakpoints, type), options);

    if (error != null) {
      if (localtableOptions.localization) {
        localtableOptions.localization.noRecordsToDisplay =
          typeof error.response?.data.detail == 'string'
            ? error.response?.data.detail
            : localtableOptions.localization.noRecordsToDisplay;
      }
    }

    return localtableOptions;
  }, [options, breakpoints, merge_method, type, error]);

  const table = useMaterialReactTable({
    columns,
    data: data ?? [],
    ...tableOptions,
    ...state,
    state: {
      ...state?.state,
      isLoading: data === undefined && !isFetched,
      showSkeletons: data === undefined && !isFetched,
    },
  });

  if (isFirstRender) {
    // Sets the columnFilterFns on the first render to avoid a bug with the columnFilterFns not being set correctly
    table.setColumnFilterFns((prev) => ({
      ...prev,
      ...(state?.state?.columnFilterFns ?? {}),
    }));
    setIsFirstRender(false);
  }

  return table;
};
