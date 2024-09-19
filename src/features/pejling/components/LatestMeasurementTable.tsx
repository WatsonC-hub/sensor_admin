import {Update} from '@mui/icons-material';
import {Box, IconButton} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';
import React, {useMemo} from 'react';
import {toast} from 'react-toastify';

import {convertDateWithTimeStamp, limitDecimalNumbers} from '~/helpers/dateConverter';
import {TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {queryClient} from '~/queryClient';
import {stamdataStore} from '~/state/store';
import {LatestCalculatedMeasurement, LatestMeasurement} from '~/types';

type LatestMeasurementTableProps = {
  latestMeasurement: Array<LatestMeasurement | LatestCalculatedMeasurement> | undefined;
  ts_id: number;
};

const LatestMeasurementTable = ({latestMeasurement, ts_id}: LatestMeasurementTableProps) => {
  console.log(latestMeasurement);
  const [timeseries] = stamdataStore((state) => [state.timeseries]);
  const unit = timeseries.tstype_id === 1 ? ' m' : ' ' + timeseries.unit;

  const columns = useMemo<MRT_ColumnDef<LatestMeasurement | LatestCalculatedMeasurement>[]>(
    () => [
      {
        header: 'Dato',
        id: 'timeofmeas',
        accessorFn: (row) => convertDateWithTimeStamp(row.timeofmeas),
        sortingFn: (a, b) => (a.original.timeofmeas > b.original.timeofmeas ? 1 : -1),
        size: 160,
      },
      {
        header: 'Rå værdi',
        id: 'rawMeasurement',
        accessorFn: (row) =>
          'rawMeasurement' in row ? limitDecimalNumbers(row.rawMeasurement) + unit : '-',
        size: 120,
      },
      {
        header: 'Værdi',
        id: 'measurement',
        accessorFn: (row) => limitDecimalNumbers(row.measurement) + unit,
        enableColumnFilter: false,
        size: 120,
      },
    ],
    [unit]
  );

  const options: Partial<MRT_TableOptions<LatestMeasurement | LatestCalculatedMeasurement>> = {
    localization: MRT_Localization_DA,
    positionExpandColumn: 'last',
    positionActionsColumn: 'last',
    enableRowActions: true,
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: false,
    enableSorting: false,
    enableTableFooter: false,
    enableStickyHeader: false,
    enableGlobalFilterRankedResults: false,
    muiTablePaperProps: {},
    muiTableContainerProps: {},
    muiTableHeadCellProps: {
      sx: {
        m: 0,
        py: 0,
      },
    },
    muiTableBodyCellProps: {
      sx: {
        m: 0,
        py: 0,
      },
    },
    renderRowActions: () => (
      <IconButton
        sx={{p: 0.5, marginRight: 0.5}}
        edge="end"
        onClick={() => {
          queryClient.invalidateQueries({
            queryKey: ['latest_measurement', ts_id],
          });
          toast.success('Genindlæst seneste måling');
        }}
        size="large"
      >
        <Update />
      </IconButton>
    ),
    renderTopToolbar: false,
    renderBottomToolbar: false,
    displayColumnDefOptions: {
      'mrt-row-actions': {
        size: 100, //if using layoutMode that is not 'semantic', the columns will not auto-size, so you need to set the size manually
        grow: false,
        muiTableHeadCellProps: {
          align: 'right',
        },
        muiTableBodyCellProps: {
          align: 'right',
        },
      },
    },
  };

  const table = useTable<LatestMeasurement | LatestCalculatedMeasurement>(
    columns,
    latestMeasurement,
    options,
    undefined,
    TableTypes.TABLE,
    undefined
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '100vw',
        mb: 1,
      }}
    >
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default LatestMeasurementTable;