// A hook that returns whether the current screen size is mobile, tablet or desktop.
import {
  type MRT_RowData,
  type MRT_TableOptions,
  type MRT_ColumnDef,
  useMaterialReactTable,
  type MRT_TableInstance,
} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';
import useBreakpoints from './useBreakpoints';
import {useMemo} from 'react';
import {merge} from 'lodash';

const getOptions = <TData extends MRT_RowData>(breakpoints: {isMobile: boolean}) => {
  const globalOptions: Partial<MRT_TableOptions<TData>> = {
    localization: MRT_Localization_DA,
    enableGlobalFilter: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: true,
    enableSorting: false,
    enableTopToolbar: false,
    enableStickyFooter: true,
    paginationDisplayMode: 'pages',
  };

  const mobileOptions: Partial<MRT_TableOptions<TData>> = {
    ...globalOptions,
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
        boxShadow: 'none',
        p: 0,
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
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        borderBottomLeftRadius: '15px',
        borderBottomRightRadius: '15px',
        '&:hover': {
          td: {
            '&:after': {
              backgroundColor: 'transparent',
            },
          },
        },
      },
    },
    muiTableProps: {
      sx: {
        borderSpacing: 5,
        border: 'none',
      },
    },
    muiPaginationProps: {
      size: 'small',
      showRowsPerPage: false,
      color: 'primary',
      shape: 'rounded',
      variant: 'outlined',
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
    muiExpandButtonProps: ({row, table}) => ({
      sx: {
        transform: row.getIsExpanded() ? 'rotate(180deg)' : 'rotate(-90deg)',
        transition: 'transform 0.2s',
      },
    }),
  };

  const desktopOptions: Partial<MRT_TableOptions<TData>> = {
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
    muiTablePaperProps: {
      sx: {
        width: '100%',
        boxShadow: '1',
        p: 0,
        margin: 'auto',
      },
    },
    muiTableBodyRowProps: {
      sx: {
        '&:hover': {
          td: {
            '&:after': {
              backgroundColor: 'transparent',
            },
          },
        },
      },
    },
    muiPaginationProps: {
      showRowsPerPage: false,
      color: 'primary',
      shape: 'rounded',
      variant: 'outlined',
    },
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
    muiTableContainerProps: {
      sx: {
        height: {
          tablet: 'calc(100vh - 30vh)',
          laptop: 'calc(100vh - 56vh)',
          desktop: 'calc(100vh - 47vh)',
        },
      },
    },
  };
  if (breakpoints.isMobile) {
    return mobileOptions;
  }

  return desktopOptions;
};

export const useTable = <TData extends MRT_RowData>(
  columns: MRT_ColumnDef<TData>[],
  data: TData[] | undefined,
  options: Partial<MRT_TableOptions<TData>>
): MRT_TableInstance<TData> => {
  const breakpoints = useBreakpoints();

  const tableOptions = merge({}, getOptions<TData>(breakpoints), options);

  const table = useMaterialReactTable({
    columns,
    data: data ?? [],
    state: {
      isLoading: data === undefined,
    },
    ...tableOptions,
  });

  return table;
};
