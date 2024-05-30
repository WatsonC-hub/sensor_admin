import {type MRT_RowData, type MRT_TableOptions} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';
//define re-useable default table options for all tables in your app
export const getDefaultMRTOptionsDesktop = <TData extends MRT_RowData>(): Partial<
  MRT_TableOptions<TData>
> => ({
  localization: MRT_Localization_DA,
  enableGlobalFilter: false,
  enableColumnActions: false,
  enableColumnFilters: false,
  enablePagination: true,
  enableSorting: false,
  enableTopToolbar: false,
  enableTableFooter: true,
  enableStickyFooter: true,
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
  paginationDisplayMode: 'pages',
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
});
