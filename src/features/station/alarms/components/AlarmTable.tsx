import {Box, Dialog, IconButton, Tooltip, Typography} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo} from 'react';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import RenderActions from '~/helpers/RowActions';
import RestoreIcon from '@mui/icons-material/Restore';
import {useAppContext} from '~/state/contexts';
import Button from '~/components/Button';
import AlarmHistoryTable from './AlarmHistoryTable';
import {alarmTable} from '../types';
import AlarmFormDialog from './AlarmFormDialog';
import AlarmContactTable from './AlarmContactTable';
import AlarmNotificationTable from './AlarmNotificationTable';
import {useAlarm} from '../api/useAlarm';
import DeleteAlert from '~/components/DeleteAlert';
import {setTableBoxStyle} from '~/consts';
import {useLocationData} from '~/hooks/query/useMetadata';
type AlarmTableProps = {
  alarms: Array<alarmTable> | undefined;
};

const AlarmTable = ({alarms}: AlarmTableProps) => {
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState<boolean>(false);
  const {ts_id} = useAppContext(['ts_id']);
  const [selectedId, setSelectedId] = React.useState<string>('');
  const {data: location_data} = useLocationData();
  const {
    getHistory: {data: alarmHistory},
    del: deleteAlarm,
  } = useAlarm();

  const handleDelete = async () => {
    deleteAlarm({path: `${ts_id}/delete/${selectedId}`});
  };

  const [alarmHistoryOpen, setAlarmHistoryOpen] = React.useState<boolean>(false);
  const columns = useMemo<MRT_ColumnDef<alarmTable>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'name',
      },
      {
        header: 'Gruppe',
        id: 'group_id',
        accessorFn: (row) =>
          location_data?.groups.find((group) => group.id === row.group_id)?.group_name,
      },
      {
        header: 'Kommentar',
        accessorKey: 'note_to_include',
        maxSize: 200,
        muiTableBodyCellProps: () => {
          return {
            sx: {
              lineBreak: 'auto',
            },
          };
        },
      },
    ],
    [location_data]
  );

  const options: Partial<MRT_TableOptions<alarmTable>> = {
    enableColumnActions: false,
    enableRowActions: true,
    enableColumnFilters: false,
    enableSorting: false,
    enablePagination: false,
    enableGlobalFilter: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    muiTableHeadProps: {
      sx: {
        zIndex: 3,
      },
    },
    renderDetailPanel: ({row}) => {
      const alarmContacts = row.original.alarm_contacts || [];
      const alarmNotification = row.original.alarm_notifications || [];
      return (
        (alarmNotification.length > 0 || alarmContacts.length > 0) && (
          <Box
            display={'flex'}
            flexDirection={'row'}
            height={'100%'}
            justifyContent={'space-between'}
            gap={2}
          >
            {alarmNotification.length > 0 && (
              <Box>
                <Typography variant="body2" fontWeight={'bold'} height={34} alignContent={'center'}>
                  Alarm notifikationer
                </Typography>
                <AlarmNotificationTable alarm_notifications={alarmNotification} />
              </Box>
            )}
            {alarmContacts && alarmContacts.length > 0 && (
              <Box display={'flex'} flexDirection={'column'}>
                <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                  <Typography variant="body2" alignContent={'center'} fontWeight={'bold'}>
                    Alarm Kontakter
                  </Typography>
                  <Tooltip title="Ingen historik tilgængelig" arrow>
                    <Box>
                      <IconButton
                        onClick={() => {
                          setAlarmHistoryOpen(true);
                        }}
                        disabled={alarmHistory?.length === 0}
                        sx={{
                          backgroundColor: 'transparent',
                        }}
                        size="small"
                      >
                        <RestoreIcon />
                        <Typography variant="caption" sx={{textDecoration: 'underline'}} ml={1}>
                          Se historik
                        </Typography>
                      </IconButton>
                    </Box>
                  </Tooltip>
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
          setSelectedId(row.original.id);
          setOpenDeleteDialog(true);
        }}
      />
    ),
    renderEditRowDialogContent: ({row, table}) => {
      return (
        <AlarmFormDialog
          open={true}
          onClose={() => {
            table.setEditingRow(null);
          }}
          setOpen={(open) => table.setEditingRow(open ? row : null)}
          alarm={row.original}
        />
      );
    },
    onEditingRowCancel: ({table}) => {
      table.setEditingRow(null);
    },
  };

  const table = useTable<alarmTable>(
    columns,
    alarms,
    options,
    undefined,
    TableTypes.TABLE,
    MergeType.RECURSIVEMERGE
  );

  return (
    <Box sx={setTableBoxStyle(800)} overflow={'hidden'} pb={1}>
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
