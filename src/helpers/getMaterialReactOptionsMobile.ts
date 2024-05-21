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
});
