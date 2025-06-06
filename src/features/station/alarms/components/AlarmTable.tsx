import {Box, Dialog, IconButton, Typography} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo} from 'react';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {alarmTable} from '~/types';
import AlarmContactTable from './AlarmContactTable';
import OtherAlarmsTable from './OtherAlarmsTable';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import RenderActions from '~/helpers/RowActions';
import RestoreIcon from '@mui/icons-material/Restore';
import {useQuery} from '@tanstack/react-query';
import {useAppContext} from '~/state/contexts';
import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';
type AlarmTableProps = {
  alarm: alarmTable;
};

const AlarmTable = ({alarm}: AlarmTableProps) => {
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
      >(`/sensor_field/stamdata/contact/alarm_history/${ts_id}`);
      return data;
    },
    enabled: !!ts_id,
  });

  const [alarmOn, setAlarmOn] = React.useState<boolean>(true);
  const [alarmHistoryOpen, setAlarmHistoryOpen] = React.useState<boolean>(false);
  const columns = useMemo<MRT_ColumnDef<alarmTable>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'name',
        size: 20,
      },
      {
        header: 'Værdi',
        accessorKey: 'value',
        size: 20,
        Cell: () => {
          return (
            <Typography variant="body2" sx={{whiteSpace: 'nowrap'}}>
              {'Ikke angivet'}
            </Typography>
          );
        },
      },
      {
        header: 'Alarm tilstand',
        accessorKey: 'alarmState',
        size: 20,
        Cell: () => {
          return (
            <IconButton onClick={() => setAlarmOn(!alarmOn)} size="small">
              {alarmOn ? (
                <NotificationsIcon color="inherit" />
              ) : (
                <NotificationsOffIcon color="disabled" />
              )}
            </IconButton>
          );
        },
      },
    ],
    [alarmOn]
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
    getIsRowExpanded: (row) => {
      return row.original.alarmContacts?.length > 0 || row.original.otherAlarms?.length > 0;
    },
    renderDetailPanel: ({row}) => {
      const alarmContacts = row.original.alarmContacts || [];
      const otherAlarms = row.original.otherAlarms || [];
      return (
        <Box sx={{padding: 2}} display={'flex'} flexDirection={'row'} gap={2}>
          {otherAlarms.length > 0 && (
            <Box>
              <Typography variant="body2" fontWeight={'bold'} sx={{marginBottom: 2}}>
                Øvrige Alarmer
              </Typography>
              <OtherAlarmsTable otherAlarms={otherAlarms} />
            </Box>
          )}
          {alarmContacts && (
            <Box display={'flex'} flexDirection={'column'} width={'100%'}>
              <Box display={'flex'} gap={1} justifyContent={'space-between'} alignItems={'center'}>
                <Typography variant="body2" alignContent={'center'} fontWeight={'bold'}>
                  Alarm Kontakter
                </Typography>
                <IconButton
                  onClick={() => {
                    setAlarmHistoryOpen(true);
                    // handleRestore(row.original.gid);
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
      );
    },
    renderRowActions: ({row}) => (
      <RenderActions
        handleEdit={() => {
          console.log('Edit action clicked for row:', row.original);
          // handleEdit(row.original);
        }}
        onDeleteBtnClick={() => {
          console.log('Delete action clicked for row:', row.original);
          // onDeleteBtnClick(row.original.gid);
        }}
      />
    ),
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
          <Typography variant="h6" gutterBottom>
            Alarm Historik
          </Typography>
          {alarmHistory && alarmHistory.length > 0 ? (
            <MaterialReactTable
              columns={[
                {
                  header: 'Navn',
                  accessorKey: 'name',
                },
                {
                  header: 'Dato',
                  accessorFn: (row) => convertDateWithTimeStamp(row.date),
                  id: 'date',
                },
                {
                  header: 'Kontakt type',
                  accessorKey: 'sent_type',
                },
                {
                  header: 'Alarm',
                  accessorKey: 'alarm',
                },
                {
                  header: 'Nedre alarm niveau',
                  accessorKey: 'alarm_low',
                },
              ]}
              data={alarmHistory}
              enableColumnActions={false}
              enableColumnFilters={false}
              enableSorting={false}
              enablePagination={false}
              enableGlobalFilter={false}
              enableTopToolbar={false}
            />
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
                // handleRestore(row.original.gid);
              }}
            >
              Gem
            </Button>
          </Box>
        </Box>
      </Dialog>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default AlarmTable;
