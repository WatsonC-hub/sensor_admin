import {useMediaQuery, useTheme} from '@mui/material';
import {MaterialReactTable, useMaterialReactTable} from 'material-react-table';
import {getDefaultMRTOptionsDesktop} from '~/helpers/getMaterialReactOptionsDesktop';
import {getDefaultMRTOptionsMobile} from '~/helpers/getMaterialReactOptionsMobile';

interface TableProps {
  columns: any;
  data: any;
  options: any;
}

function FormTableComponent({columns, data, options}: TableProps) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  const getOptions = matches ? getDefaultMRTOptionsMobile() : getDefaultMRTOptionsDesktop();

  const table = useMaterialReactTable({
    ...getOptions,
    columns,
    data,
    ...options,
  });

  return <MaterialReactTable table={table}></MaterialReactTable>;
}

export default FormTableComponent;
