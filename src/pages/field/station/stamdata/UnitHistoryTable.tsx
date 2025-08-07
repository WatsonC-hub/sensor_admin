import {Box, Grid2, Typography} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import React, {useMemo} from 'react';
import {useFormContext} from 'react-hook-form';
import Button from '~/components/Button';
import usePermissions from '~/features/permissions/api/usePermissions';
import {UnitHistory, useUnitHistory} from '~/features/stamdata/api/useUnitHistory';
import UnitForm from '~/features/stamdata/components/stamdata/UnitForm';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import RenderActions from '~/helpers/RowActions';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {useTable} from '~/hooks/useTable';
import {useAppContext} from '~/state/contexts';
import SaveIcon from '@mui/icons-material/Save';
import moment from 'moment';
import {editUnitSchema} from '~/features/station/schema';

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
  const {data: metadata} = useTimeseriesData();
  const {location_permissions} = usePermissions(loc_id);
  const disabled = location_permissions !== 'edit';

  const resetToDefault = (unit: UnitHistory) => {
    const {data: parsedData} = editUnitSchema.safeParse({
      unit_uuid: unit.uuid,
      startdate: unit.startdato,
      enddate: unit.slutdato,
    });
    reset(parsedData);
  };

  const columns = useMemo<MRT_ColumnDef<UnitHistory>[]>(
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
          row.slutdato < moment().toISOString() ? convertDateWithTimeStamp(row.slutdato) : 'Nu',
        header: 'Slutdato',
        size: 20,
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<UnitHistory>> = {
    enableRowActions: true,
    enableColumnActions: false,
    enableColumnFilters: false,
    renderRowActions: ({table, row}) => (
      <RenderActions
        handleEdit={() => {
          setSelectedUnit(row.original.gid);
          resetToDefault(row.original);
          table.setEditingRow(row);
        }}
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
                resetToDefault(row.original);
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
        <Grid2 container spacing={1} direction={'column'} width={'100%'}>
          <Grid2 container size={12} spacing={1} width={'fit-content'}>
            <Grid2 width={100}>
              <Typography variant="body2" fontWeight={'bold'}>
                Startdato:
              </Typography>
            </Grid2>
            <Grid2>
              <Typography variant="body2" maxWidth={150}>
                {convertDateWithTimeStamp(row.original.startdato)}
              </Typography>
            </Grid2>
          </Grid2>
          <Grid2 container size={12} spacing={1} width={'fit-content'}>
            <Grid2 width={100}>
              <Typography variant="body2" fontWeight={'bold'}>
                Slutdato:
              </Typography>
            </Grid2>
            <Grid2>
              <Typography variant="body2" maxWidth={150}>
                {convertDateWithTimeStamp(row.original.slutdato)}
              </Typography>
            </Grid2>
          </Grid2>
          <Grid2 container size={12} spacing={1} width={'fit-content'}>
            <Grid2 width={100}>
              <Typography variant="body2" fontWeight={'bold'}>
                Calypso ID:
              </Typography>
            </Grid2>
            <Grid2>
              <Typography variant="body2" maxWidth={150}>
                {row.original.calypso_id}
              </Typography>
            </Grid2>
          </Grid2>
          <Grid2 container size={12} spacing={1} width={'fit-content'}>
            <Grid2 width={100}>
              <Typography variant="body2" fontWeight={'bold'}>
                Terminal ID:
              </Typography>
            </Grid2>
            <Grid2>
              <Typography variant="body2" maxWidth={150}>
                {row.original.terminal_id}
              </Typography>
            </Grid2>
          </Grid2>
          <Grid2 container size={12} spacing={1} width={'fit-content'}>
            <Grid2 width={100}>
              <Typography variant="body2" fontWeight={'bold'}>
                Terminal type:
              </Typography>
            </Grid2>
            <Grid2>
              <Typography variant="body2" maxWidth={150}>
                {row.original.terminal_type}
              </Typography>
            </Grid2>
          </Grid2>
          <Grid2 container size={12} spacing={1} width={'fit-content'}>
            <Grid2 width={100}>
              <Typography variant="body2" fontWeight={'bold'}>
                Sensor ID:
              </Typography>
            </Grid2>
            <Grid2>
              <Typography variant="body2" maxWidth={150}>
                {row.original.sensor_id}
              </Typography>
            </Grid2>
          </Grid2>
          <Grid2 container size={12} spacing={1} width={'fit-content'}>
            <Grid2 width={100}>
              <Typography variant="body2" fontWeight={'bold'}>
                Sensor:
              </Typography>
            </Grid2>
            <Grid2>
              <Typography variant="body2" maxWidth={150}>
                {row.original.sensorinfo}
              </Typography>
            </Grid2>
          </Grid2>
        </Grid2>
      );
    },
    muiTableContainerProps: {
      sx: {
        width: '100%',
        height: '100%',
        flex: '1 1 1',
        display: 'flex',
        flexFlow: 'column',
        zIndex: 0,
        borderRadius: 4,
      },
    },
  };

  const table = useTable<UnitHistory>(
    columns,
    data,
    options,
    undefined,
    TableTypes.TABLE,
    MergeType.RECURSIVEMERGE
  );

  return (
    <Box>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default UnitHistoryTable;
