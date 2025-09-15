import {
  MRT_ColumnDef,
  MRT_RowData,
  MRT_TableOptions,
  useMaterialReactTable,
} from 'material-react-table';

const LookupTable = <TData extends MRT_RowData>(
  data: TData[],
  columns: MRT_ColumnDef<TData>[],
  isParent: boolean = true,
  options?: Partial<MRT_TableOptions<TData>>
) => {
  const table = useMaterialReactTable({
    columns: columns,
    data: data,
    enableRowActions: false,
    enableColumnActions: false,
    enableSorting: false,
    enablePagination: false,
    enableBottomToolbar: false,
    enableExpanding: isParent,
    enableTopToolbar: isParent,
    positionGlobalFilter: 'left',
    enableGlobalFilterRankedResults: isParent,
    muiSearchTextFieldProps: {
      variant: 'outlined',
      size: 'small',
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
      'mrt-row-actions': {
        header: '',
        size: 20, //if using layoutMode that is not 'semantic', the columns will not auto-size, so you need to set the size manually
        grow: false,
        muiTableHeadCellProps: {
          align: 'right',
        },
        muiTableBodyCellProps: {
          align: 'right',
        },
      },
    },
    ...options,
  });
  return table;
};

export default LookupTable;
