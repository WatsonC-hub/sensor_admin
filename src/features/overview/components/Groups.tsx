import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo, useState} from 'react';
import useGroups, {Group, Location} from '../api/useGroups';
import {Box} from '@mui/material';
import LookupTable from './LookupTable';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import {HighlightedText} from '../utils';

const Groups = () => {
  const [globalFilter, setGlobalFilter] = useState('');

  const {
    get: {data: groups},
  } = useGroups();
  const columns = useMemo<MRT_ColumnDef<Group>[]>(
    () => [
      {
        accessorKey: 'group_name',
        header: 'Gruppenavn',
        Cell: ({cell}) => (
          <HighlightedText text={String(cell.getValue())} highlight={globalFilter} />
        ),
      },
    ],
    [globalFilter]
  );

  const subRowColumns = useMemo<MRT_ColumnDef<Location>[]>(
    () => [
      {
        accessorKey: 'loc_name',
        header: 'Lokationsnavn',
        Cell: ({cell}) => (
          <HighlightedText text={String(cell.getValue())} highlight={globalFilter} />
        ),
      },
      {
        accessorKey: 'loctype',
        header: 'Lokationstype',
        Cell: ({cell}) => (
          <HighlightedText text={String(cell.getValue())} highlight={globalFilter} />
        ),
      },
    ],
    [globalFilter]
  );

  const options: Partial<MRT_TableOptions<Group>> = {
    filterFns: {
      customFilter: (row, columnId, filterValue) => {
        const originalRow: Group = row.original;
        const value = row.getValue(columnId);
        if (typeof value === 'string' && value.toLowerCase().includes(filterValue.toLowerCase())) {
          return true;
        } else {
          return originalRow.locations
            ? originalRow.locations.some(
                (item) =>
                  item.loc_name.toLowerCase().includes(filterValue.toLowerCase()) ||
                  item.loctype.toLowerCase().includes(filterValue.toLowerCase())
              )
            : false;
        }
      },
    },
    globalFilterFn: 'customFilter',
    getRowCanExpand: (row) => {
      return row.original.locations !== null && row.original.locations.length > 0;
    },
    renderDetailPanel: ({row}) => {
      const group = row.original;
      if (!group.locations || group.locations.length === 0) {
        return undefined;
      }
      return (
        <Box>
          <MaterialReactTable
            table={LookupTable<Location>(group.locations ?? [], subRowColumns, false)}
          />
        </Box>
      );
    },
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} />;
    },
    initialState: {
      showGlobalFilter: true,
      density: 'comfortable',
    },
    state: {globalFilter},
    onGlobalFilterChange: setGlobalFilter,
  };

  const table = LookupTable<Group>(groups ?? [], columns, true, options);

  return (
    <Box px={1} py={2}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default Groups;
