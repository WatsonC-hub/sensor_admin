import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import {Box, Typography} from '@mui/material';
import {MaterialReactTable} from 'material-react-table';
import React, {useMemo} from 'react';

import TooltipWrapper from '~/components/TooltipWrapper';
import {MergeType, TableTypes} from '~/helpers/enumHelper';
import RenderActions from '~/helpers/RowActions';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useTable} from '~/hooks/useTable';

import {formatInterval} from '../helpers';

import type {Channel} from '../helpers';
import type {ContactTable} from '../types';
import type {MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';

type AlarmContactTableProps = {
  alarmContacts: Array<ContactTable> | undefined;
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
};

const channelInfo: Record<
  Channel,
  {header: string; icon: React.ReactNode; disabledDescription: string; color?: string}
> = {
  sms: {
    header: 'SMS',
    icon: <SmsIcon color="primary" fontSize="small" />,
    disabledDescription: 'Telefonnummer er ikke registreret på denne kontakt',
  },
  email: {
    header: 'Email',
    icon: <EmailIcon color="primary" fontSize="small" />,
    disabledDescription: 'Email på denne kontakt er ikke registreret',
    color: '#FF9115',
  },
  call: {
    header: 'Opkald',
    icon: <CallIcon color="primary" fontSize="small" />,
    disabledDescription: 'Telefonnummer på denne kontakt er ikke registreret',
    color: '#FF9115',
  },
};

const ChannelValue = ({contact, channel}: {contact: ContactTable; channel: Channel}) => {
  const value = contact[channel];
  if (!value.selected) return <Typography variant="body2">-</Typography>;

  const text = <Typography variant="body2">{formatInterval(value)}</Typography>;
  if (!value.disabled) return text;

  const {disabledDescription, color} = channelInfo[channel];
  return (
    <TooltipWrapper description={disabledDescription} color={color}>
      {text}
    </TooltipWrapper>
  );
};

const channels: Channel[] = ['sms', 'email', 'call'];

const AlarmContactTable = ({alarmContacts, onEdit, onDelete}: AlarmContactTableProps) => {
  const {isMobile} = useBreakpoints();

  const columns = useMemo<MRT_ColumnDef<ContactTable>[]>(
    () => [
      {
        header: 'Navn',
        accessorKey: 'name',
        size: 20,
        Cell: ({cell}) => {
          // Names come as "Name - email" - show the email on its own line
          const value = cell.getValue<string>() ?? '';
          const split = value.lastIndexOf(' - ');
          const name = split === -1 ? value : value.slice(0, split);
          const email = split === -1 ? null : value.slice(split + 3);
          return (
            <Box sx={{wordBreak: 'break-word'}}>
              <Typography variant="body2">{name}</Typography>
              {email && (
                <Typography variant="caption" component="div" sx={{color: 'text.secondary'}}>
                  {email}
                </Typography>
              )}
            </Box>
          );
        },
      },
      ...(isMobile
        ? [
            // One stacked column on mobile - three columns don't fit
            {
              id: 'notifications',
              header: 'Notifikation',
              size: 20,
              Cell: ({row}) => {
                const selected = channels.filter((channel) => row.original[channel].selected);
                return (
                  <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                    {selected.map((channel) => (
                      <Box key={channel} sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                        {channelInfo[channel].icon}
                        <ChannelValue contact={row.original} channel={channel} />
                      </Box>
                    ))}
                  </Box>
                );
              },
            } satisfies MRT_ColumnDef<ContactTable>,
          ]
        : channels.map(
            (channel) =>
              ({
                header: channelInfo[channel].header,
                accessorKey: channel,
                size: 20,
                maxSize: 20,
                Cell: ({row}) => <ChannelValue contact={row.original} channel={channel} />,
              }) satisfies MRT_ColumnDef<ContactTable>
          )),
    ],
    [isMobile]
  );

  const options: Partial<MRT_TableOptions<ContactTable>> = {
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enablePagination: false,
    enableGlobalFilter: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableRowActions: !!onEdit || !!onDelete,
    renderRowActions: ({row}) => (
      <RenderActions
        handleEdit={() => onEdit?.(row.index)}
        onDeleteBtnClick={() => onDelete?.(row.index)}
        size={isMobile ? 'small' : undefined}
      />
    ),
    ...(isMobile && {
      initialState: {density: 'compact'},
      displayColumnDefOptions: {
        'mrt-row-actions': {
          size: 60,
          grow: false,
          muiTableHeadCellProps: {align: 'right'},
          muiTableBodyCellProps: {align: 'right'},
        },
      },
    }),
    muiTablePaperProps: {
      sx: {
        height: '100%',
        maxWidth: '100%',
      },
    },
    muiTableBodyCellProps: {
      sx: {
        width: 'fit-content',
        ...(isMobile && {px: 0.75}),
      },
    },
    muiTableHeadCellProps: {
      sx: {
        width: 'fit-content',
        ...(isMobile && {px: 0.75}),
      },
    },
    muiTableContainerProps: {
      sx: {
        width: '100%',
        // Last resort: scroll inside the table rather than stretching the dialog
        overflowX: 'auto',
      },
    },
  };

  const table = useTable<ContactTable>(
    columns,
    alarmContacts,
    options,
    undefined,
    TableTypes.TABLE,
    MergeType.SHALLOWMERGE
  );

  return (
    <Box
      sx={{
        alignItems: 'center',
        minWidth: 0,
        maxWidth: '100%',
      }}
    >
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default AlarmContactTable;
