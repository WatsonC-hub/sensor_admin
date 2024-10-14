import {Update} from '@mui/icons-material';
import {Box, IconButton, Typography} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';
import React, {useMemo} from 'react';
import {toast} from 'react-toastify';

import {limitDecimalNumbers, splitTimeFromDate} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {queryClient} from '~/queryClient';
import {stamdataStore} from '~/state/store';
import {LatestMeasurement} from '~/types';

type LatestMeasurementTableProps = {
  latestMeasurement: LatestMeasurement | undefined;
  ts_id: number;
  errorMessage: string | undefined;
};

const LatestMeasurementTable = ({
  latestMeasurement,
  ts_id,
  errorMessage,
}: LatestMeasurementTableProps) => {
  const [timeseries] = stamdataStore((state) => [state.timeseries]);
  const unit = timeseries.tstype_id === 1 ? ' m' : ' ' + timeseries.unit;

  const columns = useMemo<MRT_ColumnDef<LatestMeasurement>[]>(
    () => [
      {
        header: 'Dato',
        id: 'timeofmeas',
        accessorFn: (row) => {
          splitTimeFromDate(row.timeofmeas);
        },
        sortingFn: (a, b) => (a.original.timeofmeas > b.original.timeofmeas ? 1 : -1),
        size: 80,
        Cell: ({row}) => {
          const dateArray: Array<string> = splitTimeFromDate(row.original.timeofmeas);

          return (
            <>
              <span style={{display: 'inline-block'}}>{dateArray[0]}</span>{' '}
              <span style={{display: 'inline-block'}}> {dateArray[1]}</span>
            </>
          );
        },
      },
      {
        header: 'Rå værdi',
        id: 'rawMeasurement',
        Cell: ({row}) => {
          return (
            <>
              <span style={{display: 'inline-block'}}>
                {row.original.rawMeasurement
                  ? limitDecimalNumbers(row.original.rawMeasurement)
                  : ' - '}
              </span>{' '}
              {row.original.rawMeasurement && (
                <span style={{display: 'inline-block'}}> {row.original.rawMeasurementUnit}</span>
              )}
            </>
          );
        },
        size: 90,
      },
      {
        header: 'Værdi',
        id: 'measurement',
        size: 90,
        Cell: ({row}) => {
          return (
            <>
              <span style={{display: 'inline-block'}}>
                {row.original.measurement ? limitDecimalNumbers(row.original.measurement) : ' - '}
              </span>{' '}
              {row.original.measurement && <span style={{display: 'inline-block'}}> {unit}</span>}
            </>
          );
        },
      },
    ],
    [unit]
  );

  const options: Partial<MRT_TableOptions<LatestMeasurement>> = {
    localization: {
      ...MRT_Localization_DA,
      noRecordsToDisplay: errorMessage ?? MRT_Localization_DA.noRecordsToDisplay,
    },
    positionExpandColumn: 'last',
    positionActionsColumn: 'last',
    enableRowActions: true,
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: false,
    enableSorting: true,
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
        whiteSpace: 'pre-line',
      },
    },
    renderRowActions: () => (
      <IconButton
        sx={{p: 0.5, marginRight: 0.5}}
        edge="end"
        onClick={async () => {
          await queryClient.invalidateQueries({
            queryKey: ['latest_measurement', ts_id],
          });
          toast.success('Genindlæst seneste måling');
        }}
        size="large"
      >
        <Update />
      </IconButton>
    ),
    renderTopToolbar: (
      <Typography variant="body1" p={1}>
        Seneste Måling
      </Typography>
    ),
    renderBottomToolbar: false,
    displayColumnDefOptions: {
      'mrt-row-actions': {
        size: 0, //if using layoutMode that is not 'semantic', the columns will not auto-size, so you need to set the size manually
        grow: false,
        header: '',
        muiTableHeadCellProps: {
          align: 'right',
        },
        muiTableBodyCellProps: {
          align: 'right',
        },
      },
    },
  };

  const table = useTable<LatestMeasurement>(
    columns,
    latestMeasurement ? (errorMessage ? [] : [latestMeasurement]) : [],
    options,
    undefined,
    TableTypes.TABLE,
    MergeType.SHALLOWMERGE
  );

  return (
    <Box mb={1}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default LatestMeasurementTable;
