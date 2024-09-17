import {Update} from '@mui/icons-material';
import {Box, IconButton, Typography} from '@mui/material';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';
import React, {useMemo} from 'react';
import {toast} from 'react-toastify';

import {convertDateWithTimeStamp, limitDecimalNumbers} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {useTable} from '~/hooks/useTable';
import {queryClient} from '~/queryClient';
import {stamdataStore} from '~/state/store';
import {LatestCalculatedMeasurement, LatestMeasurement} from '~/types';

type LatestMeasurementMobileProps = {
  latestMeasurement: Array<LatestMeasurement | LatestCalculatedMeasurement> | undefined;
  ts_id: number;
};

const LatestMeasurementMobile = ({latestMeasurement, ts_id}: LatestMeasurementMobileProps) => {
  const [timeseries] = stamdataStore((state) => [state.timeseries]);
  const unit = timeseries.tstype_id === 1 ? ' m' : ' ' + timeseries.unit;

  const columns = useMemo<MRT_ColumnDef<LatestMeasurement | LatestCalculatedMeasurement>[]>(
    () => [
      {
        accessorFn: (row) => row,
        id: 'content',
        header: 'Indhold',
        enableHide: false,
        Cell: ({row}) => (
          <Box
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            gap={1}
            height={26}
          >
            <Box display="flex" flexDirection={'column'}>
              <Typography alignSelf={'center'} variant="caption" color="white">
                {convertDateWithTimeStamp(row.original.timeofmeas)}
              </Typography>
            </Box>

            <Typography margin="0 auto" color="white">
              {'rawMeasurement' in row.original
                ? limitDecimalNumbers(row.original.rawMeasurement) + unit
                : ' - '}
            </Typography>

            <Typography margin="0 auto" color="white">
              {limitDecimalNumbers(row.original.measurement) + unit}
            </Typography>
            <Box marginLeft={'auto'}>
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
                <Update sx={{color: 'white'}} />
              </IconButton>
            </Box>
          </Box>
        ),
      },
    ],
    [unit, ts_id]
  );

  const options: Partial<MRT_TableOptions<LatestMeasurement | LatestCalculatedMeasurement>> = {
    localization: MRT_Localization_DA,
    positionExpandColumn: 'last',
    positionActionsColumn: 'last',
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: false,
    enableSorting: false,
    enableTableFooter: false,
    enableStickyHeader: false,
    enableGlobalFilterRankedResults: false,
    renderBottomToolbar: false,
    renderTopToolbar: false,
    muiTablePaperProps: {},
    muiTableContainerProps: {},
    muiTableBodyCellProps: {
      sx: {
        borderRadius: 9999,
        border: 'none',
        backgroundColor: 'primary.main',
        alignContent: 'space-between',
      },
    },
  };

  const table = useTable<LatestMeasurement | LatestCalculatedMeasurement>(
    columns,
    latestMeasurement,
    options,
    undefined,
    TableTypes.LIST,
    MergeType.RECURSIVEMERGE
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 60,
        maxWidth: '100vw',
        mx: 'auto',
      }}
      width={'80%'}
    >
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default LatestMeasurementMobile;
