import React, {useMemo} from 'react';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import LookupTable from './LookupTable';
import {Box, Typography, Link} from '@mui/material';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import useDetails, {Details} from '../api/useUnits';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

const DetailedOverview = () => {
  const {station, location} = useNavigationFunctions();
  const {
    get: {data: units},
  } = useDetails();

  const columns = useMemo<MRT_ColumnDef<Details>[]>(
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
        size: 20,
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
        size: 20,
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

          const parentValues = row
            .getParentRow()
            ?.getLeafRows()
            .filter(
              (leafRow) => leafRow.original.groups.filter((group) => group !== null)?.length > 0
            )
            .map((leaf) => leaf.original.groups)
            .flat();
          const uniqueParentValues = Array.from(new Set(parentValues));

          // shows the group on the topmost parent row in case of a single instance of group(can include multiple groups if several are added to a location)
          // if (
          //   uniqueValues.length === 1 &&
          //   uniqueParentValues.length === 1 &&
          //   uniqueValues.length === uniqueParentValues.length
          // )
          //   return null;

          // if (uniqueValues.length >= 1 && uniqueValues.length > uniqueParentValues.length) {
          //   return (
          //     <Typography fontWeight="bold" color="#000000" fontSize="0.875rem">
          //       {uniqueValues.join(', ')}
          //     </Typography>
          //   );
          // }

          // Same as above, but the value is instead rendered on the location row
          if (
            uniqueValues.length === 1 &&
            uniqueParentValues.length === 1 &&
            uniqueValues.length !== uniqueParentValues.length
          )
            return null;

          if (uniqueValues.length >= 1 && uniqueValues.length <= uniqueParentValues.length) {
            return (
              <Typography fontWeight="bold" color="#000000" fontSize="0.875rem">
                {uniqueValues.join(', ')}
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
          return null;
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

          if (uniqueParentValues.length === 1) return null;

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
                row.original.loc_id && row.original.ts_id && station(row.original.ts_id)
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
      {
        accessorKey: 'has_alarm',
        header: 'Alarm',
        size: 20,
        // AggregatedCell: ({row, column}) => {
        //   const subRows = row.subRows;
        //   // if (row.original.projectno === '22.0045') {
        //   //   console.log(row.parentId);
        //   //   console.log(values);
        //   // }
        //   // if (row.parentId) {
        //   //   const parentSubRows = row.getParentRow()?.subRows;
        //   //   const parentValues = parentSubRows?.map((subRow) => subRow.getValue<string>(column.id));
        //   //   const uniqueParentValues = Array.from(new Set(parentValues));
        //   //   if (uniqueParentValues.length === 1) {
        //   //     return null;
        //   //   }
        //   // }
        //   const values = subRows
        //     ?.map((subRow) => subRow.getValue<string>(column.id))
        //     .filter((val) => val !== undefined);
        //   const uniqueValues = Array.from(new Set(values));

        //   if (uniqueValues.length === 1 && row.parentId === undefined) {
        //     return (
        //       <Typography fontWeight="bold" fontSize="0.875rem">
        //         {uniqueValues[0]}
        //       </Typography>
        //     );
        //   }

        //   if (row.original.loc_name === '123.1651 - Baghave') {
        //     console.log(row.parentId);
        //     console.log(uniqueValues);
        //   }

        //   // if (row.parentId === undefined && uniqueValues.length === 1) {
        //   //   return (
        //   //     <Typography fontWeight="bold" fontSize="0.875rem">
        //   //       {uniqueValues[0] ? 'Ja' : 'Nej'}
        //   //     </Typography>
        //   //   );
        //   // }
        //   return (
        //     <Typography fontWeight="bold" fontSize="0.875rem">
        //       {uniqueValues.length === 1 ? row.getValue<string>(column.id) : ''}
        //     </Typography>
        //   );
        // },
        Cell: ({row}) => {
          const parentSubRows = row.getParentRow()?.subRows;
          return (
            <Typography fontSize="0.875rem">
              {parentSubRows && parentSubRows.length > 1 ? row.original.has_alarm : ''}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'annual_price',
        header: 'Årlig pris',
        size: 20,
        AggregatedCell: ({row, column}) => {
          const values = row.subRows?.map((subRow) => subRow.getValue<string>(column.id));
          const total = values?.reduce((acc, val) => Number(acc) + Number(val), 0);
          return (
            <Box display="flex" flexDirection="row" gap={1}>
              {row.parentId === undefined && (
                <Typography fontWeight="bold" fontSize="0.875rem">
                  Samlet årlig pris:
                </Typography>
              )}
              <Typography color="#132c9f" fontSize="0.875rem">
                {total?.toString().includes('.') ? total.toFixed(2) : total} kr.
              </Typography>
            </Box>
          );
        },
        Cell: ({row, column}) => {
          const parentSubRows = row.getParentRow()?.subRows;
          return (
            <Typography color="#132c9f" fontSize="0.875rem">
              {parentSubRows &&
                parentSubRows.length > 1 &&
                Number(row.getValue<string>(column.id)).toFixed(2) + ' kr.'}
            </Typography>
          );
        },
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<Details>> = {
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

  const table = LookupTable<Details>(units ?? [], columns, true, options);

  return (
    <Box px={1} py={2}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default DetailedOverview;
