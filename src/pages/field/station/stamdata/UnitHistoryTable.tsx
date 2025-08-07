import {Box, Typography} from '@mui/material';
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_ExpandButton,
  MRT_TableOptions,
} from 'material-react-table';
import React, {useEffect, useMemo} from 'react';
import {useFormContext} from 'react-hook-form';
import Button from '~/components/Button';
import usePermissions from '~/features/permissions/api/usePermissions';
import {UnitHistory, useUnitHistory} from '~/features/stamdata/api/useUnitHistory';
import UnitForm from '~/features/stamdata/components/stamdata/UnitForm';
import {checkEndDateIsUnset, convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {useTable} from '~/hooks/useTable';
import {useAppContext} from '~/state/contexts';
import SaveIcon from '@mui/icons-material/Save';
import useBreakpoints from '~/hooks/useBreakpoints';
import {renderDetailStyle} from '~/consts';

interface UnitHistoryTableProps {
  submit: (data: any) => void;
  setSelectedUnit: (ugid: number | '') => void;
}

const UnitHistoryTable = ({submit, setSelectedUnit}: UnitHistoryTableProps) => {
  const {loc_id} = useAppContext(['loc_id']);
  const {data} = useUnitHistory();
  const {
    handleSubmit,
    reset,
    formState: {isDirty},
  } = useFormContext();
  const {isMobile} = useBreakpoints();
  const {data: metadata} = useTimeseriesData();
  const {location_permissions} = usePermissions(loc_id);
  const disabled = location_permissions !== 'edit';

  const desktopColumns = useMemo<MRT_ColumnDef<UnitHistory>[]>(
    () => [
      {
        accessorKey: 'calypso_id',
        header: 'Calypso ID',
        size: 20,
      },
      {
        accessorFn: (row) => convertDateWithTimeStamp(row.startdato),
        header: 'Startdato',
        size: 20,
      },
      {
        accessorFn: (row) =>
          checkEndDateIsUnset(row.slutdato) ? 'Nu' : convertDateWithTimeStamp(row.slutdato),
        header: 'Slutdato',
        size: 20,
      },
    ],
    []
  );

  const mobileColumns = useMemo<MRT_ColumnDef<UnitHistory>[]>(
    () => [
      {
        accessorFn: (row) => row,
        id: 'content',
        header: 'Indhold',
        Cell: ({row, table, staticRowIndex}) => (
          <Box
            style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
            gap={0.5}
            height={26}
          >
            <MRT_ExpandButton row={row} table={table} staticRowIndex={staticRowIndex} />
            <Typography alignSelf={'center'} variant="caption" fontWeight="bold" width="2.5rem">
              {row.original.calypso_id}
            </Typography>
            <Box display={'flex'} flexDirection={'row'} gap={1}>
              <Box display={'flex'} flexDirection={'column'}>
                <Typography
                  alignSelf={'start'}
                  variant="caption"
                  color="grey.700"
                  fontWeight="bold"
                >
                  Fra:
                </Typography>
                <Typography
                  alignSelf={'start'}
                  variant="caption"
                  color="grey.700"
                  fontWeight="bold"
                >
                  Til:
                </Typography>
              </Box>
              <Box display={'flex'} flexDirection={'column'}>
                <Typography
                  alignSelf={'start'}
                  variant="caption"
                  color="grey.700"
                  fontWeight="bold"
                >
                  {convertDateWithTimeStamp(row.original.startdato)}
                </Typography>
                <Typography
                  alignSelf={'start'}
                  variant="caption"
                  color="grey.700"
                  fontWeight="bold"
                >
                  {checkEndDateIsUnset(row.original.slutdato)
                    ? 'Nu'
                    : convertDateWithTimeStamp(row.original.slutdato)}
                </Typography>
              </Box>
            </Box>
            <Box marginLeft={'auto'}>
              <RenderActions
                handleEdit={() => {
                  setSelectedUnit(row.original.gid);
                  reset({
                    unit_uuid: row.original.uuid,
                    startdate: row.original.startdato,
                    enddate: row.original.slutdato,
                  });
                  table.setEditingRow(row);
                }}
                onDeleteBtnClick={() => {}}
                size="small"
              />
            </Box>
          </Box>
        ),
      },
    ],
    [setSelectedUnit, reset]
  );

  const options: Partial<MRT_TableOptions<UnitHistory>> = {
    enableRowActions: !isMobile,
    enableColumnActions: false,
    enableColumnFilters: false,
    renderRowActions: ({table, row}) =>
      !isMobile && (
        <RenderActions
          handleEdit={() => {
            setSelectedUnit(row.original.gid);
            reset({
              unit_uuid: row.original.uuid,
              startdate: row.original.startdato,
              enddate: row.original.slutdato,
            });
            table.setEditingRow(row);
          }}
          onDeleteBtnClick={() => {}}
        />
      ),
    onEditingRowCancel: ({table}) => {
      setSelectedUnit('');
      reset();
      table.setEditingRow(null);
    },
    renderEditRowDialogContent: ({table, row}) => {
      return (
        <Box sx={{p: 2}}>
          <UnitForm mode="edit" />
          <Box display="flex" gap={1} justifyContent="flex-end" justifySelf="end">
            <Button
              bttype="tertiary"
              onClick={() => {
                reset({
                  unit_uuid: row.original.uuid,
                  startdate: row.original.startdato,
                  enddate: row.original.slutdato,
                });
                table.setEditingRow(null);
              }}
            >
              Annuller
            </Button>
            <Button
              bttype="primary"
              disabled={!isDirty || !metadata?.unit_uuid || disabled}
              onClick={async () => {
                await handleSubmit(submit, (e) => {
                  console.log('Form submitted:', e);
                })();
                setSelectedUnit('');
                table.setEditingRow(null);
              }}
              startIcon={<SaveIcon />}
              sx={{marginRight: 1}}
            >
              Gem
            </Button>
          </Box>
        </Box>
      );
    },
    renderDetailPanel: ({row}) => {
      return (
        <Box display={'flex'} flexDirection={'row'} sx={isMobile ? {...renderDetailStyle} : {}}>
          <Box display={'flex'} flexDirection={'column'} width="150px" gap={0.5}>
            <Typography variant="body2" fontWeight={'bold'}>
              Startdato:
            </Typography>
            <Typography variant="body2" fontWeight={'bold'}>
              Slutdato:
            </Typography>
            <Typography variant="body2" fontWeight={'bold'}>
              Calypso ID:
            </Typography>
            <Typography variant="body2" fontWeight={'bold'}>
              Terminal ID:
            </Typography>
            <Typography variant="body2" fontWeight={'bold'}>
              Terminal type:
            </Typography>
            <Typography variant="body2" fontWeight={'bold'}>
              Sensor ID:
            </Typography>
            <Typography variant="body2" fontWeight={'bold'}>
              Sensor:
            </Typography>
          </Box>
          <Box display={'flex'} flexDirection={'column'} width="100%" gap={0.5}>
            <Typography variant="body2">
              {convertDateWithTimeStamp(row.original.startdato)}
            </Typography>
            <Typography variant="body2">
              {checkEndDateIsUnset(row.original.slutdato)
                ? 'Nu'
                : convertDateWithTimeStamp(row.original.slutdato)}
            </Typography>
            <Typography variant="body2">{row.original.calypso_id}</Typography>
            <Typography variant="body2">{row.original.terminal_id}</Typography>
            <Typography variant="body2">{row.original.terminal_type}</Typography>
            <Typography variant="body2">{row.original.sensor_id}</Typography>
            <Typography variant="body2">{row.original.sensorinfo}</Typography>
          </Box>
        </Box>
      );
    },
    muiTableContainerProps: !isMobile
      ? {
          sx: {
            width: '100%',
            height: '100%',
            flex: '1 1 1',
            display: 'flex',
            flexFlow: 'column',
            zIndex: 0,
            borderRadius: 4,
          },
        }
      : {},
  };

  const tableDesktop = useTable<UnitHistory>(
    desktopColumns,
    data,
    options,
    undefined,
    TableTypes.TABLE,
    MergeType.RECURSIVEMERGE
  );

  const tableMobile = useTable<UnitHistory>(
    mobileColumns,
    data,
    options,
    undefined,
    TableTypes.LIST,
    MergeType.RECURSIVEMERGE
  );

  useEffect(() => {}, [isMobile]);

  return (
    <Box key={isMobile ? 'mobile' : 'desktop'}>
      <MaterialReactTable
        key={isMobile ? 'mobile' : 'desktop'}
        table={isMobile ? tableMobile : tableDesktop}
      />
    </Box>
  );
};

export default UnitHistoryTable;
