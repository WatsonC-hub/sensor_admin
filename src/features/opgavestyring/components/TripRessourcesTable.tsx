import {Box} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo} from 'react';

import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {TaskRessources} from '~/types';

type Props = {
  ressources: Array<TaskRessources> | undefined;
};

const TripContactTable = ({ressources}: Props) => {
  const columns = useMemo<MRT_ColumnDef<TaskRessources>[]>(
    () => [
      {
        header: 'Kategori',
        accessorKey: 'kategori',
        size: 20,
        grow: false,
      },
      {
        header: 'navn',
        accessorKey: 'navn',
        size: 250,
        enableGrouping: false,
        grow: false,
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<TaskRessources>> = useMemo(
    () => ({
      enableColumnActions: false,
      enablePagination: false,
      enableSorting: false,
      groupedColumnMode: 'remove',
      muiTableContainerProps: {},
      enableGrouping: true,
      enableTopToolbar: false,
      enableBottomToolbar: false,
      state: {
        grouping: ['kategori'],
      },
      initialState: {
        expanded: true,
        grouping: ['kategori'],
      },
    }),
    []
  );

  const table = useTable<TaskRessources>(
    columns,
    ressources,
    options,
    undefined,
    TableTypes.TABLE,
    MergeType.SHALLOWMERGE
  );

  return (
    <Box p={1}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default TripContactTable;
