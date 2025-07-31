import React, {useMemo} from 'react';
import useAlarms, {Alarm} from '../api/useAlarms';
import {Box, Checkbox} from '@mui/material';
import {MRT_ColumnDef, MRT_TableOptions, MaterialReactTable} from 'material-react-table';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';
import LookupTable from './LookupTable';
import {CriteriaTable} from '~/features/station/alarms/types';
import {ContactTable} from '~/types';

const criteriaTypes = [
  {id: 'alarm_high', name: 'Øvre alarmniveau'},
  {id: 'alarm_low', name: 'Nedre alarmniveau'},
  {id: 'attention_high', name: 'Øvre opmærksomhedsniveau'},
  {id: 'attention_low', name: 'Nedre opmærksomhedsniveau'},
] as const;

const Alarms = () => {
  const {
    get: {data: alarms},
  } = useAlarms();

  const columns = useMemo<MRT_ColumnDef<Alarm>[]>(
    () => [
      {
        accessorKey: 'gid',
        header: 'GID',
        size: 10,
      },
      {
        accessorKey: 'name',
        header: 'Alarm navn',
        size: 20,
      },
      {
        accessorKey: 'alarm_interval',
        header: 'interval (t)',
        size: 20,
      },
      {
        accessorKey: 'earliest_timeofday',
        header: 'Tidligste tidspunkt',
        size: 20,
      },
      {
        accessorKey: 'latest_timeofday',
        header: 'Seneste tidspunkt',
        size: 20,
      },
      {
        accessorKey: 'signal_warning',
        header: 'Signal advarsel',
        Cell: ({cell}) => (cell.getValue() ? 'Ja' : 'Nej'),
        size: 20,
      },
    ],
    []
  );

  const columnsCriteria = useMemo<MRT_ColumnDef<CriteriaTable>[]>(
    () => [
      {
        header: 'Navn',
        id: 'name',
        accessorFn: (row) => criteriaTypes.find((c) => c.id === row.name)?.name || row.name,
        size: 250,
      },
      {
        header: 'Kriteria',
        accessorKey: 'criteria',
        size: 20,
      },
      {
        header: 'SMS/Mail/Mobil',
        accessorKey: 'contactType',
        size: 160,
        Cell: ({cell}) => {
          const {sms, email, call} = cell.row.original;
          return (
            <Box>
              <Checkbox checked={sms} disabled />
              <Checkbox checked={email} disabled />
              <Checkbox checked={call} disabled />
            </Box>
          );
        },
      },
    ],
    []
  );

  const columnsContacts = useMemo<MRT_ColumnDef<ContactTable>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Kontakt navn',
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<Alarm>> = {
    initialState: {
      showGlobalFilter: true,
      density: 'comfortable',
    },
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} />;
    },
    getRowCanExpand: (row) => {
      return (
        (row.original.contacts !== null && row.original.contacts.length > 0) ||
        (row.original.criteria !== null && row.original.criteria.length > 0)
      );
    },
    renderDetailPanel: ({row}) => {
      const alarm = row.original;
      const hasCriteria = alarm.criteria && alarm.criteria.length > 0;
      const hasContacts = alarm.contacts && alarm.contacts.length > 0;

      if (!hasCriteria && !hasContacts) {
        return undefined;
      }

      return (
        <Box display={'flex'} flexDirection="row" gap={1} justifyContent={'center'} width={'100%'}>
          {hasCriteria && (
            <MaterialReactTable
              table={LookupTable<CriteriaTable>(row.original.criteria, columnsCriteria, false)}
            />
          )}
          {hasContacts && (
            <MaterialReactTable
              table={LookupTable<ContactTable>(row.original.contacts, columnsContacts, false)}
            />
          )}
        </Box>
      );
    },
  };

  const table = LookupTable<Alarm>(alarms ?? [], columns, true, options);

  return (
    <Box px={1} py={2}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default Alarms;
