import zIndex from '@mui/material/styles/zIndex';
import {type MRT_RowData, type MRT_TableOptions} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';

//define re-useable default table options for all tables in your app
export const getDefaultMRTOptionsMobile = <TData extends MRT_RowData>(): Partial<
  MRT_TableOptions<TData>
> => ({
  localization: MRT_Localization_DA,
  enableGlobalFilter: false,
  enableColumnActions: false,
  enableColumnFilters: false,
  enablePagination: true,
  enableSorting: false,
  enableTopToolbar: false,
  enableTableFooter: false,
  enableStickyFooter: true,
  paginationDisplayMode: 'pages',
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
});
