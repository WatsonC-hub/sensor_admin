import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HeightIcon from '@mui/icons-material/Height';
import InfoIcon from '@mui/icons-material/Info';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import SignalCellularConnectedNoInternet0BarRoundedIcon from '@mui/icons-material/SignalCellularConnectedNoInternet0BarRounded';
import SpeedIcon from '@mui/icons-material/Speed';
import StraightenIcon from '@mui/icons-material/Straighten';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import {Box, IconButton, Tooltip, Typography} from '@mui/material';
import React, {useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import TableComponent from 'src/components/TableComponent';
import useBreakpoints from 'src/hooks/useBreakpoints';
import {stationTableAtom} from 'src/state/atoms';
import {authStore} from '../../../../state/store';

function typeIcon(type) {
  let icon;

  if (type == 'Vandstand') {
    icon = <StraightenIcon style={{color: 'grey', transform: 'rotate(90deg)'}} />;
  } else if (type == 'Temperatur') {
    icon = <ThermostatIcon style={{color: 'grey'}} />;
  } else if (type == 'Nedbør') {
    icon = <img width="25" height="25" style={{marginRight: '5px'}} src="/rainIcon.png" />;
  } else if (type == 'Hastighed') {
    icon = <SpeedIcon style={{color: 'grey'}} />;
  } else if (type.toLowerCase().includes('ilt')) {
    icon = <img width="20" height="20" style={{marginRight: '5px'}} src="/oxygenIcon.png" />;
  } else if (type.toLowerCase().includes('vandføring')) {
    icon = <img width="25" height="25" style={{marginRight: '5px'}} src="/waterFlowIcon.png" />;
  } else if (type == 'Fugtighed') {
    icon = <img width="25" height="25" style={{marginRight: '5px'}} src="/soilMoistureIcon.png" />;
  } else {
    icon = <InfoIcon style={{color: 'grey'}} />;
  }

  return (
    <Tooltip arrow title={type} enterTouchDelay={0}>
      {icon}
    </Tooltip>
  );
}

function statusIcon(row) {
  let icon;
  const color = row.color;
  const task = row.opgave;
  const active = row.active;
  if (!active) {
    icon = <CheckCircleIcon style={{color: 'grey'}} />;
  } else {
    if (task == 'Ok') {
      icon = <CheckCircleIcon style={{color: 'mediumseagreen'}} />;
    } else if (task == null) {
      icon = <CheckCircleIcon style={{color: 'mediumseagreen'}} />;
    } else if (task == 'Sender ikke' || task == 'Sender null') {
      icon = (
        <SignalCellularConnectedNoInternet0BarRoundedIcon
          style={{color: color, strokeWidth: 0.5, stroke: '#aaaaaa'}}
        />
      );
    } else if (task == 'Batterskift') {
      icon = <BatteryAlertIcon style={{color: color, strokeWidth: 0.5, stroke: '#aaaaaa'}} />;
    } else if (task.includes('Tilsyn')) {
      icon = <BuildRoundedIcon style={{color: color, strokeWidth: 0.5, stroke: '#aaaaaa'}} />;
    } else if (task.includes('Pejling')) {
      icon = <HeightIcon style={{color: color, strokeWidth: 0.5, stroke: '#aaaaaa'}} />;
    } else {
      icon = <PriorityHighIcon style={{color: color, strokeWidth: 0.5, stroke: '#aaaaaa'}} />;
    }
  }

  return (
    <Tooltip arrow title={task} enterTouchDelay={0}>
      {icon}
    </Tooltip>
  );
}

const StationTable = ({data, isLoading}) => {
  const {isTouch} = useBreakpoints();
  const navigate = useNavigate();
  const adminAccess = authStore((state) => state.adminAccess);
  const mobileColumns = useMemo(
    () => [
      {
        header: 'Tidsserie ID',
        accessorKey: 'ts_id',
        enableHide: false,
      },
      {
        header: '#',
        accessorKey: 'calypso_id',
        size: 5,
        maxSize: 5,
      },
      {
        header: 'Tidsserie',
        accessorKey: 'ts_name',
        size: 80,
        Cell: ({row}) => {
          return (
            <Box display="flex">
              {typeIcon(row.original.tstype_name)}
              <Typography fontSize={'0.8rem'}>{row.original.ts_name}</Typography>
            </Box>
          );
        },
      },
      {
        header: 'Status',
        accessorKey: 'opgave',
        size: 20,
        Cell: ({row}) => statusIcon(row.original),
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
      },
    ],
    []
  );

  const columns = useMemo(
    () => [
      {
        header: 'Tidsserie ID',
        accessorKey: 'ts_id',
        enableHide: false,
      },
      {
        header: isTouch ? '#' : 'Calypso ID',
        accessorKey: 'calypso_id',
      },
      {
        header: 'Tidsserienavn',
        accessorKey: 'ts_name',
        enableHiding: false,
      },
      {
        header: 'Parameter',
        accessorKey: 'tstype_name',
        Cell: ({row}) => {
          return (
            <Box display="flex">
              {typeIcon(row.original.tstype_name)}
              <Typography>{row.original.tstype_name}</Typography>
            </Box>
          );
        },
      },
      {
        header: 'Status',
        accessorKey: 'opgave',
        Cell: ({row}) => statusIcon(row.original),
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
      },
    ],
    []
  );

  const renderDetailPanel = ({row}) => (
    <Box
      sx={{
        display: 'grid',
        margin: 'auto',
        gridTemplateColumns: '1fr 1fr',
        width: '100%',
      }}
    >
      <Typography>Tidsserie id: {row.original.ts_id}</Typography>
    </Box>
  );

  const rowActions = ({row}) => (
    <Box gap={0.5}>
      <Tooltip arrow title="Gå til tidsserie" enterTouchDelay={0}>
        <IconButton
          size="small"
          sx={{backgroundColor: 'secondary.main'}}
          onClick={() => {
            navigate(`/field/location/${row.original.loc_id}/${row.original.ts_id}`);
          }}
        >
          <QueryStatsIcon />
        </IconButton>
      </Tooltip>
      {adminAccess && (
        <Tooltip arrow title="Gå til kvalitetssikring" enterTouchDelay={0}>
          <IconButton
            size="small"
            sx={{backgroundColor: 'secondary.main'}}
            onClick={() => navigate(`/admin/kvalitetssikring/${row.original.ts_id}`)}
          >
            <AutoGraphIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  return (
    <TableComponent
      data={data}
      columns={isTouch ? mobileColumns : columns}
      isLoading={isLoading}
      renderDetailPanel={renderDetailPanel}
      rowActions={rowActions}
      tableStateAtom={stationTableAtom}
    />
  );
};

export default StationTable;
