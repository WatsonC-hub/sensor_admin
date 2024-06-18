import DirectionsIcon from '@mui/icons-material/Directions';
import InfoIcon from '@mui/icons-material/Info';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import SpeedIcon from '@mui/icons-material/Speed';
import StraightenIcon from '@mui/icons-material/Straighten';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import {Box, Divider, Tooltip, Typography} from '@mui/material';
import {
  MRT_ColumnDef,
  MRT_Row,
  MRT_TableInstance,
  MRT_TableOptions,
  MaterialReactTable,
} from 'material-react-table';
import React, {useMemo} from 'react';

import Button from '~/components/Button';
import {calculateContentHeight} from '~/consts';
import {TableTypes} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import {useTable} from '~/hooks/useTable';
import {TableData} from '~/types';

import NotificationIcon from './NotificationIcon';
import RenderInternalActions from '~/components/tableComponents/RenderInternalActions';

interface Props {
  data: TableData[];
}

interface RenderDetailProps {
  row: MRT_Row<TableData>;
  table: MRT_TableInstance<TableData>;
}

function typeIcon(type: string) {
  let icon;

  if (type == 'Vandstand') {
    icon = <StraightenIcon style={{color: 'grey', transform: 'rotate(90deg)'}} />;
  } else if (type == 'Temperatur') {
    icon = <ThermostatIcon style={{color: 'grey'}} />;
  } else if (type == 'Nedbør') {
    icon = <img alt="" width="25" height="25" style={{marginRight: '5px'}} src="/rainIcon.png" />;
  } else if (type == 'Hastighed') {
    icon = <SpeedIcon style={{color: 'grey'}} />;
  } else if (type.toLowerCase().includes('ilt')) {
    icon = <img alt="" width="20" height="20" style={{marginRight: '5px'}} src="/oxygenIcon.png" />;
  } else if (type.toLowerCase().includes('vandføring')) {
    icon = (
      <img alt="" width="25" height="25" style={{marginRight: '5px'}} src="/waterFlowIcon.png" />
    );
  } else if (type == 'Fugtighed') {
    icon = (
      <img alt="" width="25" height="25" style={{marginRight: '5px'}} src="/soilMoistureIcon.png" />
    );
  } else {
    icon = <InfoIcon style={{color: 'grey'}} />;
  }

  return (
    <Tooltip arrow title={type} enterTouchDelay={0}>
      {icon}
    </Tooltip>
  );
}

export default function StationTable({data}: Props) {
  const {station} = useNavigationFunctions();
  const {isTouch} = useBreakpoints();

  const columns = useMemo<MRT_ColumnDef<TableData>[]>(
    () => [
      {
        header: 'Status',
        accessorKey: 'opgave',
        size: 20,
        Cell: ({row}) => (
          <Box
            display={'flex'}
            alignContent={'center'}
            sx={{
              fontSize: isTouch ? '1.5rem' : '2rem',
            }}
          >
            <NotificationIcon iconDetails={row.original} enableTooltip />
          </Box>
        ),
        sortingFn: (a, b) => {
          // sort based on flag
          if (a.original.flag === b.original.flag) {
            return 0;
          }
          if (a.original.flag > b.original.flag) {
            return 1;
          }
          return -1;
        },
        muiTableHeadCellProps: {
          sx: {
            padding: 1,
          },
        },
      },
      {
        header: 'Tidsserie',
        accessorKey: 'ts_name',
        size: 20,
        maxSize: 30,
        Cell: ({row, renderedCellValue}) => {
          return (
            <Box display="flex" alignItems={'center'}>
              {typeIcon(row.original.tstype_name)}
              <Typography fontSize={'0.8rem'}>{renderedCellValue}</Typography>
            </Box>
          );
        },
        muiTableHeadCellProps: {
          sx: {
            padding: 0,
          },
        },
      },
      ...(isTouch
        ? []
        : [
            {
              header: 'Tidsserie ID',
              accessorKey: 'ts_id',
              enableHide: false,
            },
          ]),
      {
        header: 'Calypso ID',
        accessorKey: 'calypso_id',
        size: 40,
        muiTableHeadCellProps: {
          sx: {
            padding: 0,
          },
        },
      },
    ],
    [isTouch]
  );
  const [tableState, reset] = useStatefullTableAtom<TableData>('StationTableState');

  const renderDetailPanel = ({row}: RenderDetailProps) => (
    <Box
      sx={{
        backgroundColor: row.getIsSelected() ? 'grey.300' : 'inherit',
      }}
    >
      <Box
        display={'flex'}
        alignItems={'center'}
        alignContent={'center'}
        justifyContent={'space-between'}
        pl={1}
        py={1}
        width="98%"
      >
        <Typography
          display={'flex'}
          flexDirection={'row'}
          variant="caption"
          color="grey.700"
          fontWeight="bold"
          alignSelf={'center'}
          alignContent={'center'}
          alignItems={'center'}
          gap={1}
        >
          Parameter:
          {typeIcon(row.original.tstype_name)}
          <Typography variant="caption" color="grey.700">
            {row.original.tstype_name}
          </Typography>
        </Typography>

        <Typography
          display={'flex'}
          flexDirection={'row'}
          variant="caption"
          color="grey.700"
          fontWeight="bold"
          alignSelf={'center'}
          alignContent={'center'}
          py={1}
          pr={1}
          gap={1}
        >
          Tidsserie ID:
          <Typography variant="caption" color="grey.700">
            {row.original.ts_id}
          </Typography>
        </Typography>
      </Box>
      <Divider />
      <Box
        display={'flex'}
        alignItems={'center'}
        alignContent={'center'}
        justifyContent={'space-between'}
      >
        <Box>
          <Typography display={'flex'} flexDirection={'row'} fontWeight="bold" gap={1} m={1}>
            <Typography alignSelf={'center'} variant="caption" color="grey.700" fontWeight="bold">
              Mest kritiske status:
            </Typography>
            <NotificationIcon iconDetails={row.original} />
            <Typography alignSelf={'center'} variant="caption" color="grey.700">
              {row.original.opgave}
            </Typography>
          </Typography>

          {/* <Typography display={'flex'} flexDirection={'row'} fontWeight="bold" gap={1} m={1}>
            <Typography alignSelf={'center'} variant="caption" color="grey.700" fontWeight="bold">
              Andre status:
            </Typography>
          </Typography> */}
          {/* 
          <Typography display={'flex'} flexDirection={'row'} fontWeight="bold" gap={1} m={1}>
            <Typography alignSelf={'center'} variant="caption" color="grey.700" fontWeight="bold">
              Info ift. kontakt:
            </Typography>
            <Typography alignSelf={'center'} variant="caption" color="grey.700">
              Skriv kontakt detaljer her!
            </Typography>
          </Typography>

          <Typography display={'flex'} flexDirection={'row'} fontWeight="bold" gap={1} m={1}>
            <Typography alignSelf={'center'} variant="caption" color="grey.700" fontWeight="bold">
              Nøgle:
            </Typography>
            <Typography alignSelf={'center'} variant="caption" color="grey.700">
              Hentes hos lodsejer på dagen
            </Typography>
          </Typography> */}
        </Box>
      </Box>
      <Box
        display={'flex'}
        flexDirection={'row'}
        pb={1}
        justifyContent={isTouch ? 'space-evenly' : 'center'}
        gap={isTouch ? 0 : 1}
      >
        <Button
          bttype="primary"
          onClick={() => {
            window.open(
              `https://www.google.com/maps/search/?api=1&query=${row.original.x},${row.original.y}`,
              '_blank'
            );
          }}
          startIcon={<DirectionsIcon />}
        >
          Google Maps
        </Button>
        <Button
          bttype="primary"
          onClick={() => {
            station(row.original.loc_id, row.original.ts_id);
          }}
          startIcon={<ShowChartRoundedIcon />}
        >
          Tidsserie
        </Button>
      </Box>
    </Box>
  );
  const options: Partial<MRT_TableOptions<TableData>> = {
    renderDetailPanel: renderDetailPanel,
    renderToolbarInternalActions: ({table}) => {
      return <RenderInternalActions table={table} reset={reset} />;
    },
    muiTableBodyRowProps: ({row}) => {
      return {
        onDoubleClick: () => {
          station(row.original.loc_id, row.original.ts_id);
        },
      };
    },
    enableExpanding: true,
    enableExpandAll: false,
    muiTableHeadCellProps: {
      sx: {
        flex: '0 0 auto',
        fontSize: '0.8rem',
      },
    },
    muiTableBodyCellProps: {
      sx: {
        px: 0.5,
        flex: '0 0 auto',
        fontSize: '0.8rem',
        textWrap: 'wrap',
      },
    },
    positionExpandColumn: 'last',
    // muiExpandButtonProps: ({row, table}) => ({
    //   sx: {
    //     px: 0,
    //   },
    //   size: 'small',
    // }),
  };

  const table = useTable<TableData>(columns, data, options, tableState, TableTypes.STATIONTABLE);

  return (
    <Box
      justifyContent={'center'}
      alignSelf={'center'}
      p={1}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: calculateContentHeight(160),
        minWidth: '50%',
        width: '100%',
        maxWidth: '1080px',
        justifySelf: 'center',
      }}
    >
      <MaterialReactTable table={table} />
    </Box>
  );
}
