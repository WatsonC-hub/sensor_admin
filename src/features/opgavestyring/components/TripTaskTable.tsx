import {Box, Link, Typography} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo} from 'react';

import {getIcon} from '~/features/notifications/utils';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';

import {LocationTasks} from '~/types';
import {sharedTableOptions} from '../shared_options';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

type Props = {
  tasks: Array<LocationTasks> | undefined;
};

const TripTaskTable = ({tasks}: Props) => {
  const {station} = useNavigationFunctions();
  const moreSpace = tasks?.some((task) => task.count > 9) ?? false;
  const columns = useMemo<MRT_ColumnDef<LocationTasks>[]>(
    () => [
      {
        header: 'Opgave type',
        accessorKey: 'name',
        Cell: ({cell, row}) => (
          <Box display="flex" gap={1} alignItems="center">
            <Box
              display={'flex'}
              flexDirection={'row'}
              alignItems={'center'}
              gap={moreSpace ? 0.5 : 0}
            >
              <Typography width={20} variant="body2">
                {row.original.count + 'x '}
              </Typography>
              <Box height={22} width={22} display="flex" alignSelf={'center'}>
                {row.original.blocks_notifications.length > 0
                  ? getIcon({notification_id: row.original.blocks_notifications?.[0]}, false)
                  : getIcon({mapicontype: 'task'}, false)}
              </Box>
            </Box>
            <Typography variant="body2">
              {cell.getValue<string>().concat(' - ', row.original.tstype_name)}
            </Typography>
          </Box>
        ),
      },
    ],
    [moreSpace]
  );

  const options: Partial<MRT_TableOptions<LocationTasks>> = useMemo(
    () => ({
      ...(sharedTableOptions as Partial<MRT_TableOptions<LocationTasks>>),
      positionExpandColumn: 'last',
      renderTopToolbar: (
        <Typography variant="body1" pt={1} px={1}>
          Opgaver
        </Typography>
      ),
      renderDetailPanel: ({row}) => (
        <Box display={'flex'} flexDirection={'column'} p={1} gap={1}>
          {row.original.link_name?.map((name, index) => (
            <Link
              key={index}
              sx={{cursor: 'pointer'}}
              onClick={() => {
                station(row.original.ts_ids[index]);
              }}
            >
              <Typography key={index} variant="body2">
                {name}
              </Typography>
            </Link>
          ))}
        </Box>
      ),
    }),
    []
  );

  const table = useTable<LocationTasks>(
    columns,
    tasks,
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

export default TripTaskTable;
