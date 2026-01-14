import * as React from 'react';
import {
  MRT_Cell,
  MRT_ColumnDef,
  MRT_GlobalFilterTextField,
  MRT_Row,
  MRT_RowData,
  MRT_TableBodyCellValue,
  MRT_TableInstance,
  useMaterialReactTable,
} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack,
  Typography,
  IconButton,
  Divider,
  Tooltip,
} from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import EventIcon from '@mui/icons-material/Event';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {RestartAlt} from '@mui/icons-material';
import {ActivityRow, CommentRow, EventRow} from './types';
import {useAllActivityOptions} from './activityQueries';
import TooltipWrapper from '~/components/TooltipWrapper';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Mock Data
// -----------------------------------------------------------------------------

const MOCK_DATA: ActivityRow[] = [
  {
    id: 'c1',
    kind: 'comment',
    scope: 'location',
    comment: 'Meget svært at tilgå om vinteren.',
    flags: [1],
    pinned: false,
    createdAt: '2026-01-12T09:15:00Z',
    createdBy: 'Alex',
  },
  {
    id: 'e1',
    kind: 'event',
    comment: 'Udstyr udskiftet',
    createdAt: '2026-01-10T14:00:00Z',
    createdBy: 'system',
    scope: 'timeseries',
  },
  {
    id: 'c2',
    kind: 'comment',
    scope: 'timeseries',
    comment: 'Data for denne tidsserie er meget ujævn pga. sporadisk sensorfejl.',
    flags: [1, 2],
    pinned: true,
    createdAt: '2026-01-10T08:30:00Z',
    createdBy: 'Maria',
  },
  {
    id: 'e2',
    kind: 'event',
    comment: 'Billede tilføjet til lokalitet',
    scope: 'location',
    createdAt: '2026-01-05T11:20:00Z',
    createdBy: 'Alex',
  },
  {
    id: 'c3',
    kind: 'comment',
    scope: 'location',
    comment: 'Adgang til lokaliteten kræver en 4x4 efter kraftig regn.',
    flags: [1, 2],
    pinned: false,
    createdAt: '2026-01-02T16:45:00Z',
    createdBy: 'Alex',
  },
];

// -----------------------------------------------------------------------------
// Column Definitions (logic-only, not visual)
// -----------------------------------------------------------------------------

const ActivityTableContext = React.createContext<MRT_TableInstance<ActivityRow> | null>(null);

const useActivityTableContext = () => {
  const context = React.useContext(ActivityTableContext);
  if (!context) {
    throw new Error('useActivityTableContext must be used within an ActivityTableProvider');
  }
  return context;
};

const columns: MRT_ColumnDef<ActivityRow>[] = [
  {
    id: 'content',
    header: 'Indhold',
    accessorKey: 'comment',
    // enableGlobalFilter: true,
    enableColumnFilter: false,
  },
  {
    id: 'pinned',
    header: 'Fastgjort',
    accessorFn: (row) => (row.kind === 'comment' ? row.pinned : false),
    enableColumnFilter: false,
  },
  {
    id: 'kind',
    header: 'Type',
    accessorKey: 'kind',
    enableColumnFilter: true,
    filterSelectOptions: [
      {label: 'Comment', value: 'comment'},
      {label: 'Event', value: 'event'},
    ],
    filterVariant: 'multi-select',
    filterFn: 'arrIncludesSome',
  },
  {
    id: 'flags',
    header: 'Flag',
    accessorFn: (row) => (row.kind === 'comment' ? row.flags.join('|') : ''),
    filterVariant: 'autocomplete',
  },
  {
    id: 'scope',
    header: 'Område',
    accessorKey: 'scope',
    enableColumnFilter: true,
    filterSelectOptions: [
      {label: 'Lokation', value: 'location'},
      {label: 'Tidsserie', value: 'timeseries'},
    ],
    filterVariant: 'multi-select',
    filterFn: 'arrIncludesSome',
  },
  {
    id: 'createdAt',
    header: 'Oprettet den',
    accessorKey: 'createdAt',
    enableColumnFilter: false,
  },
  {
    id: 'createdBy',
    header: 'Oprettet af',
    accessorKey: 'createdBy',
    enableColumnFilter: false,
  },
];

// -----------------------------------------------------------------------------
// Row Cards
// -----------------------------------------------------------------------------

function CommentCard({row}: {row: MRT_Row<CommentRow>}) {
  const {data: activityOptions} = useAllActivityOptions();

  const isPinned = row.original.pinned;

  const table = useActivityTableContext();

  const cells = row.getVisibleCells();

  const contentCell = cells.find((cell) => cell.column.id === 'content') as MRT_Cell<ActivityRow>;

  const search = table.getState().globalFilter;
  return (
    <Card variant="outlined" sx={{borderColor: isPinned ? 'primary.main' : 'divider'}}>
      <CardHeader
        title={
          row.original.scope === 'timeseries' ? `Kommentar på tidsserie` : 'Kommentar på lokalitet'
        }
        sx={{
          pb: 0,
          mb: 0,
        }}
        subheader={`${row.original.createdBy} · ${convertDateWithTimeStamp(row.original.createdAt)}`}
        action={
          <IconButton size="small">
            <PushPinIcon fontSize="small" color={isPinned ? 'primary' : 'disabled'} />
          </IconButton>
        }
      />
      <CardContent sx={{pt: 0}}>
        {row.original.flags && (
          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
            {row.original.flags.map((id) => {
              const option = activityOptions?.find((opt) => opt.id === id);
              const val = option ? option.label : `Ukendt aktivitet (${id})`;
              const isMatch = search && val.toLowerCase().includes(search.toLowerCase());
              return (
                <TooltipWrapper description={option?.description || ''} key={val} withIcon={false}>
                  <Chip
                    key={val}
                    size="medium"
                    label={val}
                    variant={isMatch ? 'filled' : 'outlined'}
                    color={isMatch ? 'secondary' : 'default'}
                  />
                </TooltipWrapper>
              );
            })}
          </Stack>
        )}
        <Typography variant="body1" mt={2}>
          <MRT_TableBodyCellValue table={table} cell={contentCell} />
        </Typography>
      </CardContent>
    </Card>
  );
}

function EventCard({row}: {row: MRT_Row<EventRow>}) {
  return (
    <Card variant="outlined" sx={{backgroundColor: 'action.hover'}}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center">
          <EventIcon fontSize="small" color="action" />
          <Typography variant="body2">{row.original.comment}</Typography>
          <Typography variant="caption" color="text.secondary">
            · {convertDateWithTimeStamp(row.original.createdAt)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

type ResetTableStateButtonProps<TData extends MRT_RowData> = {
  table: MRT_TableInstance<TData>;
  tooltip?: string;
};

export function ResetTableStateButton<TData extends MRT_RowData>({
  table,
  tooltip = 'Reset view',
}: ResetTableStateButtonProps<TData>) {
  return (
    <Tooltip title={tooltip}>
      <IconButton onClick={() => table.reset()}>
        <RestartAlt />
      </IconButton>
    </Tooltip>
  );
}

function ActivityRowRenderer({row}: {row: MRT_Row<ActivityRow>}) {
  return row.original.kind === 'comment' ? (
    <CommentCard row={row as MRT_Row<CommentRow>} />
  ) : (
    <EventCard row={row as MRT_Row<EventRow>} />
  );
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

interface ActivityTimelineTableProps {
  data?: ActivityRow[];
}

export default function ActivityTimelineTable({data = []}: ActivityTimelineTableProps) {
  const table = useMaterialReactTable({
    localization: MRT_Localization_DA,
    columns,
    data: data,
    getRowId: (originalRow) => originalRow.id,
    enableGlobalFilter: true, // ← REQUIRED
    globalFilterFn: 'includesString',

    // enableRowPinning: true,
    enablePagination: false,
    enableSorting: true,
    enableHiding: false,
    enableColumnFilters: true,

    initialState: {
      sorting: [
        {id: 'pinned', desc: true},
        {id: 'createdAt', desc: true},
      ],
      rowPinning: {
        top: ['c2'],
      },
      showGlobalFilter: true,
    },
  });

  const rows = table.getRowModel().rows;
  return (
    <Box display={'flex'} flexDirection={'column'} gap={2} width="100%">
      {/* MRT logic container */}
      {/* <MaterialReactTable table={table} /> */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/**
         * Use MRT components along side your own markup.
         * They just need the `table` instance passed as a prop to work!
         */}
        {/* <MRT_TablePagination table={table} /> */}
        <MRT_GlobalFilterTextField table={table} />
        <ResetTableStateButton table={table} />
      </Box>
      {/* <MRT_TopToolbar table={table} /> */}

      {/* <table>
        <MRT_TableHead table={table} />
      </table> */}

      {/* Custom headless rendering */}
      <Stack spacing={2} mt={2}>
        <ActivityTableContext.Provider value={table}>
          {rows.map((row, index) => (
            <React.Fragment key={row.id}>
              <ActivityRowRenderer row={row} />
              {index < rows.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </ActivityTableContext.Provider>
      </Stack>

      {/* <MRT_BottomToolbar table={table} /> */}
    </Box>
  );
}
