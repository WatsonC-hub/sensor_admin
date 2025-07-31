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
    ...options,
  });
  return table;
};

export default LookupTable;
