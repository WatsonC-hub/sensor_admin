// A hook that returns whether the current screen size is mobile, tablet or desktop.
import {merge} from 'lodash';
import {
  type MRT_RowData,
  type MRT_TableOptions,
  type MRT_ColumnDef,
  useMaterialReactTable,
  type MRT_TableInstance,
} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';

import TopToolbar from '~/components/tableComponents/TopToolbar';

import useBreakpoints from './useBreakpoints';

const getOptions = <TData extends MRT_RowData>(
  breakpoints: {
    isMobile: boolean;
  },
  type: 'list' | 'table'
) => {
  const globalOptions: Partial<MRT_TableOptions<TData>> = {
    localization: MRT_Localization_DA,
    enableGlobalFilter: false,
    enableColumnFilters: false,
    enablePagination: true,
    // enableSorting: false,
    // enableTopToolbar: false,
    enableStickyFooter: true,
    muiPaginationProps: {
      size: 'small',
      showRowsPerPage: true,
      color: 'primary',
      shape: 'rounded',
      variant: 'outlined',
    },
    paginationDisplayMode: 'pages',
  };

  const mobileOptions: Partial<MRT_TableOptions<TData>> = merge({}, globalOptions, {
    enableTableFooter: false,
    enableTableHead: false,
    enableExpandAll: false,
    muiTableBodyCellProps: {
      sx: {
        borderRadius: 9999,
        border: 'none',
        backgroundColor: 'grey.300',
        alignContent: 'space-between',
      },
    },
    muiTablePaperProps: {
      sx: {
        flex: '1 1 0',
        display: 'flex',
        'flex-flow': 'column',
        boxShadow: 'none',
        p: 0,
      },
    },
    muiTableContainerProps: {
      sx: {
        flex: '1 1 0',
        pb: 0.5,
      },
    },
    muiTableFooterProps: {
      sx: {
        boxShadow: 'none',
      },
    },
    muiTableBodyRowProps: {
      sx: {
        display: 'table-row !important',
        border: 'none',
        backgroundColor: 'grey.300',
        background: 'grey.300',
        mt: -7.7,
        px: 2,
        mx: -2,
        transition: 'transform 0.2s',
        borderTopLeftRadius: 'x',
        borderTopRightRadius: '20p20px',
        borderBottomLeftRadius: '15px',
        borderBottomRightRadius: '15px',
      },
    },
    muiTableProps: {
      sx: {
        borderSpacing: 5,
        border: 'none',
      },
    },

    initialState: {
      density: 'compact',
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
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
    muiExpandButtonProps: ({row}) => ({
      sx: {
        transform: row.getIsExpanded() ? 'rotate(180deg)' : 'rotate(-90deg)',
        transition: 'transform 0.2s',
      },
    }),
  } as Partial<MRT_TableOptions<TData>>);

  const desktopOptions: Partial<MRT_TableOptions<TData>> = merge({}, globalOptions, {
    ...globalOptions,
    enableTableFooter: true,
    enableStickyHeader: true,
    enableRowActions: true,
    enableTableHead: true,
    displayColumnDefOptions: {
      'mrt-row-actions': {
        size: 100, //if using layoutMode that is not 'semantic', the columns will not auto-size, so you need to set the size manually
        grow: false,
      },
    },
    muiTableProps: {
      size: 'small',
    },
    positionActionsColumn: 'last',
    muiTableBodyRowProps: {
      sx: {
        '&:hover': {
          td: {
            '&:after': {
              // backgroundColor: 'transparent',
            },
          },
        },
      },
    },
    renderTopToolbar: TopToolbar,
    initialState: {
      density: 'comfortable',
    },
    muiTableHeadCellProps: {
      size: 'small',
      align: 'left',
    },
    muiTableBodyCellProps: {
      size: 'small',
      align: 'left',
    },
    muiTablePaperProps: {
      sx: {
        width: '100%',
        boxShadow: '1',
        p: 0,
        margin: 'auto',
        flex: '1 1 0',
        display: 'flex',
        'flex-flow': 'column',
      },
    },
    muiTableContainerProps: {
      sx: {
        flex: '1 1 0',
      },
    },
  } as Partial<MRT_TableOptions<TData>>);
  if (breakpoints.isMobile) {
    return mobileOptions;
  }

  return desktopOptions;
};

export const useTable = <TData extends MRT_RowData>(
  columns: MRT_ColumnDef<TData>[],
  data: TData[] | undefined,
  options: Partial<MRT_TableOptions<TData>>,
  tableState: Partial<MRT_TableOptions<TData>>,
  type: 'list' | 'table' = 'list'
): MRT_TableInstance<TData> => {
  const breakpoints = useBreakpoints();

  const tableOptions = merge({}, getOptions<TData>(breakpoints, type), options);

  const table = useMaterialReactTable({
    columns,
    data: data ?? [],
    initialState: {
      isLoading: data === undefined,
    },
    ...tableOptions,
    ...tableState,
  });

  return table;
};
