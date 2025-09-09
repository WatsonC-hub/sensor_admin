import {Link, Box} from '@mui/material';

import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo} from 'react';
import {MergeType, stationPages, TableTypes} from '~/helpers/EnumHelper';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useStationPages} from '~/hooks/useQueryStateParameters';
import {useTable} from '~/hooks/useTable';
import {TaskLocationAccess} from '~/types';

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
        size: 60,
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
        size: 150,
      },
      {
        header: 'Type',
        accessorKey: 'type',
        size: 30,
      },
      {
        header: 'Fysisk placering',
        accessorFn: (row) => row.physical_location || 'WatsonC',
        size: 30,
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<TaskLocationAccess>> = useMemo(
    () => ({
      enableFullScreenToggle: false,
      enableGlobalFilter: false,
      positionExpandColumn: 'first',
      enableColumnActions: false,
      enableColumnFilters: false,
      enablePagination: false,
      enableSorting: false,
      enableTableFooter: false,
      enableStickyHeader: false,
      enableMultiSort: false,
      enableFilters: false,
      groupedColumnMode: 'remove',
      enableGlobalFilterRankedResults: false,
      muiTableContainerProps: {},
      enableTopToolbar: false,
      enableFacetedValues: true,
      enableBottomToolbar: false,
      enableExpanding: false,
      enableExpandAll: false,
      muiTableHeadCellProps: {
        sx: {
          m: 0,
          p: 1,
        },
      },
      muiTableBodyCellProps: {
        sx: {
          m: 0,
          p: 1,
          whiteSpace: 'pre-line',
        },
      },
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
