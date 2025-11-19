import {Download} from '@mui/icons-material';
import {Box, IconButton, Typography} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import dayjs, {Dayjs} from 'dayjs';
import {MaterialReactTable, MRT_ColumnDef, MRT_TableOptions} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';
import React, {useMemo} from 'react';
import {apiClient} from '~/apiClient';
import TooltipWrapper from '~/components/TooltipWrapper';

import {limitDecimalNumbers, splitTimeFromDate} from '~/helpers/dateConverter';
import {MergeType, TableTypes} from '~/helpers/EnumHelper';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import {useTable} from '~/hooks/useTable';
import {useAppContext} from '~/state/contexts';

type LastJupiterMPData = {
  description: string | undefined;
  elevation: number | null;
  startdate: Dayjs;
};

type LastJupiterMPAPI = {
  descriptio: string | undefined;
  elevation: number | null;
  startdate: string;
};

const JupiterMPTable = () => {
  const {boreholeno, intakeno, ts_id} = useAppContext(['boreholeno', 'ts_id'], ['intakeno']);
  const {
    get: {data: ourMP},
    post: addWatlevmp,
  } = useMaalepunkt(ts_id);

  const {data} = useQuery({
    queryKey: queryKeys.Borehole.lastMP(boreholeno, intakeno),
    queryFn: async () => {
      const {data} = await apiClient.get<LastJupiterMPAPI>(
        `/sensor_field/borehole/last_mp/${boreholeno}/${intakeno}`
      );
      return {
        description: data.descriptio,
        elevation: data.elevation,
        startdate: dayjs(data.startdate),
      } as LastJupiterMPData;
    },
    enabled: !!boreholeno && !!intakeno,
  });

  const showQuickAdd = data
    ? ourMP && ourMP.length > 0
      ? data.startdate.isAfter(ourMP[0].startdate)
      : true
    : false;

  const handleQuickAdd = () => {
    if (!data) return;

    const payload = {
      path: `${ts_id}`,
      data: {
        gid: -1,
        startdate: data.startdate,
        enddate: dayjs('2099-01-01'),
        elevation: data.elevation,
        mp_description: data.description ?? '',
      },
    };
    addWatlevmp.mutate(payload);
  };

  const columns = useMemo<MRT_ColumnDef<LastJupiterMPData>[]>(
    () => [
      {
        header: 'Dato',
        accessorKey: 'startdate',
        size: 80,
        Cell: ({row}) => {
          const dateArray: Array<string> = splitTimeFromDate(row.original.startdate.toString());

          return (
            <>
              <span style={{display: 'inline-block'}}>{dateArray[0]}</span>{' '}
              <span style={{display: 'inline-block'}}> {dateArray[1]}</span>
            </>
          );
        },
      },
      {
        header: 'Kote [m (DVR90)]',
        accessorKey: 'elevation',
        Cell: ({row}) => {
          return (
            <>
              <span style={{display: 'inline-block'}}>
                {row.original.elevation ? limitDecimalNumbers(row.original.elevation) : ' - '}
              </span>{' '}
            </>
          );
        },
        size: 90,
      },
      {
        header: 'Beskrivelse',
        accessorKey: 'description',
        size: 90,
      },
    ],
    []
  );

  const options: Partial<MRT_TableOptions<LastJupiterMPData>> = {
    localization: {
      ...MRT_Localization_DA,
      noRecordsToDisplay:
        intakeno === undefined
          ? 'Det var ikke muligt at søge efter et målepunkt, da tidsserien ikke har et indtagsnummer'
          : 'Kan ikke finde et målepunkt i Jupiter',
    },
    enableFullScreenToggle: false,
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
    muiTableContainerProps: {},
    muiTableHeadCellProps: {sx: {m: 0, py: 0}},
    muiTableBodyCellProps: {sx: {m: 0, py: 0, whiteSpace: 'pre-line'}},
    renderRowActions: () =>
      showQuickAdd && (
        <TooltipWrapper description="Tilføj målepunkt fra Jupiter" withIcon={false}>
          <IconButton
            sx={{p: 0.5, marginRight: 0.5}}
            edge="end"
            onClick={async () => {
              handleQuickAdd();
            }}
            size="large"
          >
            <Download />
          </IconButton>
        </TooltipWrapper>
      ),
    renderTopToolbar: (
      <Typography variant="body1" p={1}>
        Målepunkt i Jupiter
      </Typography>
    ),
    renderBottomToolbar: false,
    displayColumnDefOptions: {
      'mrt-row-actions': {
        size: 0, //if using layoutMode that is not 'semantic', the columns will not auto-size, so you need to set the size manually
        grow: false,
        header: showQuickAdd ? 'Tilføj målepunkt' : '',
        muiTableHeadCellProps: {align: 'right'},
        muiTableBodyCellProps: {align: 'right'},
      },
    },
  };

  const table = useTable<LastJupiterMPData>(
    columns,
    data ? [data] : [],
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

export default JupiterMPTable;
