import {Box, Dialog, IconButton, Typography} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo} from 'react';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import RenderActions from '~/helpers/RowActions';
import RestoreIcon from '@mui/icons-material/Restore';
import {useQuery} from '@tanstack/react-query';
import {useAppContext} from '~/state/contexts';
import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import AlarmHistoryTable from './AlarmHistoryTable';
import {alarmTable} from '../types';
import AlarmFormDialog from './AlarmFormDialog';
import AlarmContactTable from './AlarmContactTable';
import AlarmCriteriaTable from './AlarmCriteriaTable';
import {useAlarm} from '../api/useAlarm';
import DeleteAlert from '~/components/DeleteAlert';
type AlarmTableProps = {
  alarm: alarmTable;
};

const AlarmTable = ({alarm}: AlarmTableProps) => {
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState<boolean>(false);
  const {ts_id} = useAppContext(['ts_id']);
  const {data: alarmHistory} = useQuery({
    queryKey: ['alarm_history', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<
        Array<{
          date: string;
          sent_type: string;
          alarm: boolean;
          alarm_low: boolean;
          name: string;
        }>
      >(`/sensor_field/stamdata/alarms/alarm_history/${ts_id}`);
      return data;
    },
    enabled: !!ts_id,
  });

  const {del: deleteAlarm} = useAlarm();

  const handleDelete = async () => {
    deleteAlarm({path: `${ts_id}`});
  };

  const [alarmHistoryOpen, setAlarmHistoryOpen] = React.useState<boolean>(false);
  const columns = useMemo<MRT_ColumnDef<alarmTable>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'name',
        size: 20,
      },
      {
        header: 'Tidligste signalering',
        accessorKey: 'earliest_timeofday',
      },
      {
        header: 'Seneste signalering',
        accessorKey: 'latest_timeofday',
      },
      {
        header: 'Alarm Interval',
        accessorKey: 'alarm_interval',
      },
      {
        header: 'Note',
        accessorKey: 'note_to_include',
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<alarmTable>> = {
    enableColumnActions: false,
    enableRowActions: true,
    enableColumnFilters: false,
    enableSorting: false,
    enablePagination: false,
    enableGlobalFilter: false,
    enableTopToolbar: false,
    muiTablePaperProps: {
      sx: {
        width: 'fit-content',
        height: '100%',
      },
    },
    muiTableBodyCellProps: {
      sx: {
        width: 'fit-content',
      },
    },
    muiTableHeadCellProps: {
      sx: {
        width: 'fit-content',
      },
    },
    muiDetailPanelProps: {
      sx: {
        width: '100%',
        maxHeight: '100%',
      },
    },
    renderDetailPanel: ({row}) => {
      const alarmContacts = row.original.alarmContacts || [];
      const otherAlarms = row.original.alarmCriteria || [];
      return (
        Object.keys(row.original).length > 0 && (
          <Box
            sx={{padding: 2}}
            display={'flex'}
            flexDirection={'row'}
            height={'100%'}
            justifyContent={'space-around'}
          >
            {otherAlarms.length > 0 && (
              <Box>
                <Typography variant="body2" fontWeight={'bold'} height={34} alignContent={'center'}>
                  Alarm kriterier
                </Typography>
                <AlarmCriteriaTable otherAlarms={otherAlarms} />
              </Box>
            )}
            {alarmContacts && (
              <Box display={'flex'} flexDirection={'column'}>
                <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                  <Typography variant="body2" alignContent={'center'} fontWeight={'bold'}>
                    Alarm Kontakter
                  </Typography>
                  <IconButton
                    onClick={() => {
                      setAlarmHistoryOpen(true);
                    }}
                    sx={{backgroundColor: 'transparent'}}
                    size="small"
                  >
                    <RestoreIcon />
                    <Typography variant="caption" sx={{textDecoration: 'underline'}} ml={1}>
                      Se historik
                    </Typography>
                  </IconButton>
                </Box>
                <AlarmContactTable alarmContacts={alarmContacts} />
              </Box>
            )}
          </Box>
        )
      );
    },
    renderRowActions: ({row, table}) => (
      <RenderActions
        disabled={Object.keys(row.original).length === 0}
        handleEdit={() => {
          table.setEditingRow(row);
        }}
        onDeleteBtnClick={() => {
          setOpenDeleteDialog(true);
        }}
      />
    ),
    renderEditRowDialogContent: ({row, table}) => {
      return (
        <Box py={4} px={2} boxShadow={6}>
          <AlarmFormDialog
            open={true}
            onClose={() => {
              table.setEditingRow(null);
            }}
            setOpen={(open) => table.setEditingRow(open ? row : null)}
            alarm={row.original}
          />
        </Box>
      );
    },
    onEditingRowCancel: ({table}) => {
      table.setEditingRow(null);
    },
  };

  const table = useTable<alarmTable>(
    columns,
    alarm ? [alarm] : [],
    options,
    undefined,
    TableTypes.TABLE,
    MergeType.SHALLOWMERGE
  );

  return (
    <Box alignItems={'center'}>
      <Dialog
        open={alarmHistoryOpen}
        onClose={() => {
          setAlarmHistoryOpen(false);
        }}
        maxWidth={'xl'}
      >
        <Box sx={{padding: 2}}>
          {alarmHistory && alarmHistory.length > 0 ? (
            <>
              <Typography variant="h6" gutterBottom>
                Alarm Historik
              </Typography>
              <AlarmHistoryTable alarmHistory={alarmHistory} />
            </>
          ) : (
            <Typography variant="body2">Ingen historik tilgængelig</Typography>
          )}
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            sx={{paddingTop: 1}}
            gap={1}
          >
            <Button bttype="tertiary" onClick={() => setAlarmHistoryOpen(false)}>
              Luk
            </Button>
            <Button
              bttype="primary"
              onClick={() => {
                setAlarmHistoryOpen(false);
              }}
            >
              Gem
            </Button>
          </Box>
        </Box>
      </Dialog>
      <DeleteAlert
        dialogOpen={openDeleteDialog}
        setDialogOpen={setOpenDeleteDialog}
        onOkDelete={handleDelete}
      />
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default AlarmTable;
