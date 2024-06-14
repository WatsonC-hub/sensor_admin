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

import {TableTypes} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';

const getOptions = <TData extends MRT_RowData>(
  breakpoints: {
    isMobile: boolean;
  },
  type: string
) => {
  const globalOptions: Partial<MRT_TableOptions<TData>> = {
    localization: MRT_Localization_DA,
    enablePagination: true,
    enableStickyFooter: true,
    muiPaginationProps: {
      size: 'small',
      showRowsPerPage: true,
      color: 'primary',
      shape: 'rounded',
      variant: 'outlined',
    },
    paginationDisplayMode: 'pages',
    muiTablePaperProps: {
      sx: {
        width: '100%',
        flex: '1 1 0',
        display: 'flex',
        'flex-flow': 'column',
        boxShadow: breakpoints.isMobile ? 'none' : '1',
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

  const mobileOptions: Partial<MRT_TableOptions<TData>> = merge({}, globalOptions, {
    enableTableFooter: false,
    enableTableHead: false,
    enableTopToolbar: false,
    enableExpandAll: false,
    muiTableBodyCellProps: {
      sx: {
        borderRadius: 9999,
        border: 'none',
        backgroundColor: 'grey.300',
        alignContent: 'space-between',
      },
    },
    muiTableBodyRowProps: {
      // The following styling is neccessary to make sure the detail panel look as a part of the row. The purpose of the styling is to shift the detail panel upwards so that it aligns with the row.
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
    enableGlobalFilterRankedResults: true,
    positionGlobalFilter: 'left',
    enableRowActions: type === TableTypes.STATIONTABLE ? false : true,
    enableTableHead: true,
    enableFilter: false,
    displayColumnDefOptions: {
      'mrt-row-actions': {
        size: 100, //if using layoutMode that is not 'semantic', the columns will not auto-size, so you need to set the size manually
        grow: false,
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
    return mobileOptions;
  }

  return desktopOptions;
};

export const useTable = <TData extends MRT_RowData>(
  columns: MRT_ColumnDef<TData>[],
  data: TData[] | undefined,
  options: Partial<MRT_TableOptions<TData>>,
  tableState: Partial<MRT_TableOptions<TData>> | undefined,
  type: string = TableTypes.LIST
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