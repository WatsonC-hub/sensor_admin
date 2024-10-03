// A hook that returns whether the current screen size is mobile, tablet or desktop.
import {merge, assign} from 'lodash';
import {
  type MRT_RowData,
  type MRT_TableOptions,
  type MRT_ColumnDef,
  useMaterialReactTable,
  type MRT_TableInstance,
} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';

import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';

const getOptions = <TData extends MRT_RowData>(
  breakpoints: ReturnType<typeof useBreakpoints>,
  type: string
) => {
  const globalOptions: Partial<MRT_TableOptions<TData>> = {
    localization: MRT_Localization_DA,
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
    muiTablePaperProps: {
      sx: {
        width: '100%',
        flex: '1 1 0',
        display: 'flex',
        flexFlow: 'column',
        boxShadow: breakpoints.isMobile ? 'none' : '1',
      },
    },
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
          userSelect: 'none',
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

export const useTable = <TData extends MRT_RowData>(
  columns: MRT_ColumnDef<TData>[],
  data: TData[] | undefined,
  options: Partial<MRT_TableOptions<TData>>,
  state: Partial<MRT_TableOptions<TData>> | undefined,
  type: string = TableTypes.LIST,
  merge_method: string | undefined = MergeType.RECURSIVEMERGE
): MRT_TableInstance<TData> => {
  const breakpoints = useBreakpoints();

  let tableOptions: Partial<MRT_TableOptions<TData>> = options;
  if (merge_method === MergeType.SHALLOWMERGE)
    tableOptions = assign({}, getOptions<TData>(breakpoints, type), options);
  else if (merge_method === MergeType.RECURSIVEMERGE)
    tableOptions = merge({}, getOptions<TData>(breakpoints, type), options);

  const table = useMaterialReactTable({
    columns,
    data: data ?? [],
    ...tableOptions,
    ...state,
    state: {
      ...state?.state,
      isLoading: data === undefined,
      showSkeletons: data === undefined,
    },
  });

  return table;
};
