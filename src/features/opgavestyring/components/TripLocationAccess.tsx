import {Link, Box, Typography} from '@mui/material';

import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo} from 'react';
import {MergeType, stationPages, TableTypes} from '~/helpers/EnumHelper';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useStationPages} from '~/hooks/useQueryStateParameters';
import {useTable} from '~/hooks/useTable';
import {TaskLocationAccess} from '~/types';
import {sharedTableOptions} from '../shared_options';

type TripLocationAccessProps = {
  keys: Array<TaskLocationAccess> | undefined;
};

const TripLocationAccess = ({keys}: TripLocationAccessProps) => {
  const {location} = useNavigationFunctions();
  const [, setPageToShow] = useStationPages();
  const columns = useMemo<MRT_ColumnDef<TaskLocationAccess>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'name',
        grow: 1,
        maxSize: 120,
      },
      {
        header: 'Lokationer',
        accessorKey: 'loc_names',
        Cell: ({cell, row}) => (
          <>
            {(cell.getValue<string[]>() || []).map((loc, index) => (
              <Link
                key={index}
                sx={{cursor: 'pointer'}}
                display="block"
                onClick={() => {
                  location(row.original.loc_ids[index]);
                  setPageToShow(stationPages.KONTAKTER);
                }}
              >
                {loc}
              </Link>
            ))}
          </>
        ),
        maxSize: 120,
      },
      {
        header: 'Fysisk placering',
        accessorFn: (row) => row.physical_location || 'WatsonC',
        maxSize: 120,
      },
    ],
    [keys]
  );

  const options: Partial<MRT_TableOptions<TaskLocationAccess>> = useMemo(
    () => ({
      ...(sharedTableOptions as Partial<MRT_TableOptions<TaskLocationAccess>>),
      renderTopToolbar: (
        <Typography variant="body1" pt={1} px={1}>
          Nøgler
        </Typography>
      ),
    }),
    []
  );

  const table = useTable<TaskLocationAccess>(
    columns,
    keys,
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

export default TripLocationAccess;
