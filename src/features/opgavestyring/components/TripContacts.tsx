import {Box, Link} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import React, {useMemo} from 'react';
import {MergeType, stationPages, TableTypes} from '~/helpers/EnumHelper';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useStationPages} from '~/hooks/useQueryStateParameters';
import {useTable} from '~/hooks/useTable';
import {TaskContact} from '~/types';

type TripContactsProps = {
  contacts: Array<TaskContact> | undefined;
};

const TripContacts = ({contacts}: TripContactsProps) => {
  const {location} = useNavigationFunctions();
  const [, setPageToShow] = useStationPages();
  const columns = useMemo<MRT_ColumnDef<TaskContact>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'name',
        size: 120,
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
        header: 'Telefon',
        accessorKey: 'phone',
        size: 20,
      },
      {
        header: 'Email',
        accessorKey: 'email',
        size: 20,
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<TaskContact>> = useMemo(
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

  const table = useTable<TaskContact>(
    columns,
    contacts,
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

export default TripContacts;
