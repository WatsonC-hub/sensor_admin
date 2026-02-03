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
  Stack,
  Typography,
  IconButton,
  Divider,
  Tooltip,
} from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import EventIcon from '@mui/icons-material/Event';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {Check, Delete, Edit, RestartAlt} from '@mui/icons-material';
import {ActivityRow, CommentRow, EventRow} from './types';
import {useActivityDelete, useAllActivityOptions, usePinActivity} from './activityQueries';
import TooltipWrapper from '~/components/TooltipWrapper';
import dayjs from 'dayjs';
import {useMemo, useState} from 'react';
import AlertDialog from '~/components/AlertDialog';

function HighlightText({text, query}: {text: string; query?: string}) {
  if (!query) return <>{text}</>;

  const q = query.toLowerCase();
  const parts = text.split(new RegExp(`(${query})`, 'ig'));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === q ? (
          <Box
            key={i}
            component="mark"
            sx={{
              backgroundColor: 'secondary.light',
              color: 'secondary.contrastText',
              px: 0.3,
              borderRadius: 0.5,
            }}
          >
            {part}
          </Box>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

type FlagGridProps = {
  flags: Record<string, string | number | null>;
  search?: string;
  activityOptions?: {id: number; label: string; description?: string}[];
};

function FlagGrid({flags, search, activityOptions}: FlagGridProps) {
  const optionMap = useMemo(
    () => new Map(activityOptions?.map((opt) => [opt.id, opt]) ?? []),
    [activityOptions]
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr', // 📱 mobile
          sm: 'minmax(80px, max-content) minmax(0, 1fr)', // 🖥️ desktop
        },
        columnGap: 2,
        rowGap: 1,
        mt: 1,
      }}
    >
      {Object.entries(flags).map(([id, value]) => {
        const option = optionMap.get(Number(id));
        const label = option?.label ?? `Ukendt aktivitet (${id})`;

        return (
          <React.Fragment key={id}>
            {/* Key */}
            <TooltipWrapper description={option?.description || ''} withIcon={false}>
              <Typography variant="body2" sx={{fontWeight: 500, color: 'text.secondary'}}>
                <HighlightText text={label} query={search} />
              </Typography>
            </TooltipWrapper>

            {/* Value */}
            {value == null ? (
              <Check color="action" sx={{width: 'fit-content'}} />
            ) : (
              <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>
                <HighlightText text={String(value)} query={search} />
              </Typography>
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
}

// -----------------------------------------------------------------------------
// Column Definitions (logic-only, not visual)
// -----------------------------------------------------------------------------

const ActivityTableContext = React.createContext<{
  table: MRT_TableInstance<ActivityRow>;
  handleDelete: (id: string) => void;
} | null>(null);

const useActivityTableContext = () => {
  const context = React.useContext(ActivityTableContext);
  if (!context) {
    throw new Error('useActivityTableContext must be used within an ActivityTableProvider');
  }
  return context;
};

// -----------------------------------------------------------------------------
// Row Cards
// -----------------------------------------------------------------------------

function CommentCard({row}: {row: MRT_Row<CommentRow>}) {
  const {data: activityOptions} = useAllActivityOptions();
  const mutation = usePinActivity();

  const isPinned = row.original.pinned;

  const {table, handleDelete} = useActivityTableContext();

  const cells = row.getVisibleCells();

  const contentCell = cells.find((cell) => cell.column.id === 'content') as MRT_Cell<ActivityRow>;

  const search = table.getState().globalFilter;

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: isPinned ? 'primary.main' : 'divider',
        minWidth: '200px',
        maxWidth: '500px',
      }}
    >
      <CardHeader
        title={<Typography>Tilsyn</Typography>}
        sx={{
          pb: 0,
          mb: 0,
        }}
        subheader={
          <Typography
            color="text.secondary"
            variant="caption"
          >{`${row.original.created_by} · ${convertDateWithTimeStamp(row.original.created_at)}`}</Typography>
        }
        action={
          <>
            <IconButton size="small" onClick={() => mutation.mutate(row.original.id)}>
              <PushPinIcon fontSize="small" color={isPinned ? 'primary' : 'disabled'} />
            </IconButton>
            <IconButton onClick={() => table.setEditingRow(row as MRT_Row<ActivityRow>)}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDelete(row.original.id)}>
              <Delete />
            </IconButton>
          </>
        }
      />
      <Box sx={{py: 0, px: 2}}>
        {row.original.flags && (
          <FlagGrid flags={row.original.flags} activityOptions={activityOptions} search={search} />
        )}
        <Typography variant="body1" mt={2}>
          <MRT_TableBodyCellValue table={table} cell={contentCell} />
        </Typography>
      </Box>
    </Card>
  );
}

function EventCard({row}: {row: MRT_Row<EventRow>}) {
  return (
    <Card variant="outlined" sx={{backgroundColor: 'action.hover'}}>
      <CardContent
        sx={{
          display: 'flex',
          gap: 1,
        }}
      >
        <EventIcon fontSize="small" color="action" />
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">{row.original.comment}</Typography>
            <Typography variant="caption" color="text.secondary">
              · {convertDateWithTimeStamp(row.original.created_at)}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {row.original.created_by}
          </Typography>
        </Box>
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
  setEditData?: (value: ActivityRow) => void;
}

export default function ActivityTimelineTable({
  data = [],
  setEditData,
}: ActivityTimelineTableProps) {
  const {data: activityOptions} = useAllActivityOptions();
  const {mutate: deleteActivity} = useActivityDelete();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const columns = useMemo<MRT_ColumnDef<ActivityRow>[]>(
    () => [
      {
        id: 'content',
        header: 'Indhold',
        accessorKey: 'comment',
        // enableGlobalFilter: true,
        enableColumnFilter: false,
      },
      // {
      //   id: 'pinned',
      //   header: 'Fastgjort',
      //   accessorFn: (row) => (row.kind === 'comment' ? row.pinned : false),
      //   enableColumnFilter: false,
      // },
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
        accessorFn: (row) =>
          row.kind === 'comment'
            ? Object.entries(row.flags)
                .map(([id, value]) =>
                  activityOptions
                    ?.find((opt) => opt.id === Number(id))
                    ?.label.concat('|', value ? value.toString() : '')
                )
                .join('|')
            : '',
        filterVariant: 'autocomplete',
      },

      {
        id: 'created_at',
        header: 'Oprettet den',
        accessorFn: (row) => dayjs(row.created_at),
        enableColumnFilter: false,
      },
      {
        id: 'created_by',
        header: 'Oprettet af',
        accessorKey: 'created_by',
        enableColumnFilter: false,
      },
    ],
    [activityOptions]
  );

  const handleDelete = () => {
    if (deleteId) deleteActivity(deleteId);
  };

  const table = useMaterialReactTable({
    localization: MRT_Localization_DA,
    columns,
    // TODO: Maybe readd pinned column?
    data: data,
    getRowId: (originalRow) => originalRow.id.toString(),
    enableGlobalFilter: true, // ← REQUIRED
    globalFilterFn: 'includesString',
    // enableRowPinning: true,
    enablePagination: false,
    enableSorting: true,
    enableHiding: false,
    enableColumnFilters: true,
    onEditingRowChange: (updateOrValue) => {
      if (typeof updateOrValue != 'function' && updateOrValue != undefined && setEditData)
        setEditData(updateOrValue.original);
    },
    initialState: {
      sorting: [
        // {id: 'pinned', desc: true},
        {id: 'created_at', desc: true},
      ],
      rowPinning: {
        top: ['c2'],
      },
      showGlobalFilter: true,
    },
    state: {
      rowPinning: {
        top: data.filter((row) => row.pinned).map((row) => row.id),
      },
    },
  });

  const rows = table.getCenterRows();

  const topRows = table.getTopRows();
  return (
    <Box display={'flex'} flexDirection={'column'} gap={2} width="100%">
      {/* MRT logic container */}
      {/* <MaterialReactTable table={table} /> */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {/**
         * Use MRT components along side your own markup.
         * They just need the `table` instance passed as a prop to work!
         */}
        {/* <MRT_TablePagination table={table} /> */}
        <MRT_GlobalFilterTextField table={table} />
        {/* <ResetTableStateButton table={table} /> */}
      </Box>
      {/* <MRT_TopToolbar table={table} /> */}

      {/* <table>
        <MRT_TableHead table={table} />
      </table> */}

      {/* Custom headless rendering */}
      <Stack spacing={1} mt={2}>
        <ActivityTableContext.Provider value={{table, handleDelete: setDeleteId}}>
          {topRows.map((row) => (
            <React.Fragment key={row.id}>
              <ActivityRowRenderer row={row} />
              <Divider />
            </React.Fragment>
          ))}
          {rows.map((row, index) => (
            <React.Fragment key={row.id}>
              <ActivityRowRenderer row={row} />
              {index < rows.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </ActivityTableContext.Provider>
      </Stack>
      <AlertDialog
        handleOpret={handleDelete}
        open={deleteId != null}
        setOpen={() => setDeleteId(null)}
        title="Vil du slette tilsyn?"
        message="Er du sikker på du vil slette?"
      />
      {/* <MRT_BottomToolbar table={table} /> */}
    </Box>
  );
}
