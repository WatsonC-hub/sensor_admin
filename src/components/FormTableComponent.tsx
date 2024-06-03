import {useMediaQuery, useTheme} from '@mui/material';
import {getDefaultMRTOptionsDesktop} from '~/helpers/getMaterialReactOptionsDesktop';
import {getDefaultMRTOptionsMobile} from '~/helpers/getMaterialReactOptionsMobile';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_RowData, //default shape of TData (Record<string, any>)
  type MRT_TableOptions,
} from 'material-react-table';
import React from 'react';

interface Props<TData extends MRT_RowData> extends MRT_TableOptions<TData> {
  columns: MRT_ColumnDef<TData>[];
  data: TData[];
}

export const FormTableComponent = <TData extends MRT_RowData>({
  columns,
  data,
  ...rest
}: Props<TData>) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  const getOptions = matches
    ? getDefaultMRTOptionsMobile<TData>()
    : getDefaultMRTOptionsDesktop<TData>();

  const table = useMaterialReactTable({
    columns,
    data: data ?? [],
    state: {
      isLoading: data === undefined,
    },
    ...getOptions,
    ...rest, //accept props to override default table options
  });

  return <MaterialReactTable table={table}></MaterialReactTable>;
};

export default FormTableComponent;
