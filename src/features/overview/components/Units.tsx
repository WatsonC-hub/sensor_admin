import React, {useMemo} from 'react';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import LookupTable from './LookupTable';
import {Box, Typography, Link} from '@mui/material';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import useUnits, {Unit} from '../api/useUnits';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

const Units = () => {
  const {station, location} = useNavigationFunctions();
  const {
    get: {data: units},
  } = useUnits();

  const columns = useMemo<MRT_ColumnDef<Unit>[]>(
    () => [
      {
        accessorKey: 'projectno',
        accessorFn: (row) => {
          if (row.project_title) {
            return `${row.projectno} - ${row.project_title}`;
          }
          return row.projectno;
        },
        header: 'Projekt nummer',
        size: 200,
        Cell: ({row}) => {
          return (
            <a
              href={`https://www.watsonc.dk/calypso/projekt/?project=${row.original.projectno}`}
              style={{cursor: 'pointer'}}
            >
              <Typography color="#000000" fontSize={'0.875rem'}>
                {row.getValue<string>('projectno')}
              </Typography>
            </a>
          );
        },
      },
      {
        accessorKey: 'loc_name',
        header: 'Lokation',
        size: 20,
        Cell: ({row}) => {
          return (
            <Link
              sx={{cursor: 'pointer'}}
              onClick={() => row.original.loc_id && location(row.original.loc_id)}
            >
              <Typography color="#000000" fontSize={'0.875rem'}>
                {row.original.loc_name}
              </Typography>
            </Link>
          );
        },
      },
      {
        id: 'groups',
        header: 'Grupper',
        AggregatedCell: ({row}) => {
          const uniques = new Set(
            row
              .getLeafRows()
              .filter(
                (leafRow) => leafRow.original.groups.filter((group) => group !== null)?.length > 0
              )
              .map((leafRow) => leafRow.original.groups)
              .flat()
          );
          const uniqueValues = Array.from(uniques);

          if (uniqueValues.filter((value) => value !== null).length === 1) {
            return (
              <Typography fontWeight="bold" color="#000000" fontSize="0.875rem">
                {uniqueValues[0]}
              </Typography>
            );
          }

          return null;
        },
        Cell: ({row, column}) => {
          const parentRow = row.getParentRow();
          if (parentRow) {
            const parentValues = parentRow
              .getLeafRows()
              .map((leaf) => leaf.getValue<string>(column.id));
            const uniqueParentValues = Array.from(new Set(parentValues));
            if (uniqueParentValues.length === 1) {
              return null;
            }
          }
          return (
            <Typography color="#000000" fontSize="0.875rem">
              {row.getValue<string>(column.id)}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'prefix',
        header: 'Præfix',
        size: 20,
      },
      {
        header: 'Tidsserie',
        id: 'ts_data',
        accessorFn: (row) => row.ts_data,
        size: 20,
        AggregatedCell: ({row, column}) => {
          const values = row
            .getLeafRows()
            .map((leaf) => leaf.getValue<string>(column.id))
            .filter((val) => val !== undefined);
          const uniqueValues = Array.from(new Set(values));
          const parentValues = row
            .getParentRow()
            ?.getLeafRows()
            .map((leaf) => leaf.getValue<string>(column.id))
            .filter((val) => val !== undefined);
          const uniqueParentValues = Array.from(new Set(parentValues));

          if (uniqueValues.length === 1 && uniqueParentValues.length === 1) return null;

          if (uniqueValues.length === 1) {
            return (
              <Typography fontWeight="bold" color="#000000" fontSize="0.875rem">
                {uniqueValues[0]}
              </Typography>
            );
          }

          return null;
        },
        Cell: ({row, column}) => {
          const parentRow = row.getParentRow();
          if (parentRow) {
            const parentValues = parentRow
              .getLeafRows()
              .map((leaf) => leaf.getValue<string>(column.id));
            const uniqueParentValues = Array.from(new Set(parentValues));
            if (uniqueParentValues.length === 1) {
              return null;
            }
          }
          return (
            <Link
              sx={{cursor: 'pointer'}}
              onClick={() =>
                row.original.loc_id &&
                row.original.ts_id &&
                station(Number(row.original.loc_id), row.original.ts_id)
              }
            >
              <Typography color="#000000" fontSize="0.875rem">
                {row.getValue<string>(column.id)}
              </Typography>
            </Link>
          );
        },
      },
      {
        id: 'terminal_id',
        accessorFn: (row) => row.terminal_id,
        header: 'Terminal ID',
        size: 20,
        Cell: ({row}) => {
          return (
            <Box>
              <Typography fontSize={'0.875rem'}>
                {row.original.terminal_id}
                {row.original.ts_logtype && row.original.ts_logtype.length > 0
                  ? ` - ${row.original.ts_logtype}`
                  : ''}
              </Typography>
            </Box>
          );
        },
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<Unit>> = {
    positionExpandColumn: 'first',
    enableColumnDragging: false,
    enableExpanding: true,
    enableGrouping: true,
    positionGlobalFilter: 'right',
    getSubRows: (row) => row.subRows ?? [],
    initialState: {
      showGlobalFilter: true,
      density: 'comfortable',
      grouping: ['projectno', 'loc_name'],
    },

    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} />;
    },
  };

  const table = LookupTable<Unit>(units ?? [], columns, true, options);

  return (
    <Box px={1} py={2}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default Units;
