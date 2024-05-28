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
  enableExpanding: true,
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
    showRowsPerPage: false,
  },
  initialState: {
    density: 'compact',
    columnVisibility: {
      'mrt-row-expand': false,
    },
  },
});
