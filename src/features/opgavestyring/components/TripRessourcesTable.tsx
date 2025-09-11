import {Box, Typography} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo} from 'react';

import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {TaskRessources} from '~/types';
import {sharedTableOptions} from '../shared_options';

type Props = {
  ressources: Array<TaskRessources> | undefined;
};

const TripContactTable = ({ressources}: Props) => {
  const columns = useMemo<MRT_ColumnDef<TaskRessources>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'navn',
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<TaskRessources>> = useMemo(
    () => ({
      ...(sharedTableOptions as Partial<MRT_TableOptions<TaskRessources>>),
      renderTopToolbar: (
        <Typography variant="body1" pt={1} px={1}>
          Pakkeliste
        </Typography>
      ),
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
