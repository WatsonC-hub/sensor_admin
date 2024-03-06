import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HeightIcon from '@mui/icons-material/Height';
import InfoIcon from '@mui/icons-material/Info';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SignalCellularConnectedNoInternet0BarRoundedIcon from '@mui/icons-material/SignalCellularConnectedNoInternet0BarRounded';
import SpeedIcon from '@mui/icons-material/Speed';
import StraightenIcon from '@mui/icons-material/Straighten';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import {Box, IconButton, Tooltip, Typography} from '@mui/material';
import {useAtom} from 'jotai';
import {RESET} from 'jotai/utils';
import {
  MRT_GlobalFilterTextField,
  MRT_ShowHideColumnsButton,
  MRT_ToggleFiltersButton,
  MaterialReactTable,
} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';
import React, {useEffect, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import useBreakpoints from '~/hooks/useBreakpoints';
import {stationTableAtom} from '~/state/atoms';

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
  const [tableState, setTableState] = useAtom(stationTableAtom);
  // const [tableState, setTableState] = React.useState({});
  const {isTouch, isMobile} = useBreakpoints();

  const navigate = useNavigate();

  const stateChangeHandler = (stateName) => (state) => {
    setTableState((prev) => {
      return {
        ...prev,
        [stateName]: state instanceof Function ? state(prev[stateName]) : state,
      };
    });
  };

  useEffect(() => {
    if (isMobile) {
      setTableState((prev) => {
        return {
          ...prev,
          density: 'compact',
        };
      });
    } else {
      setTableState((prev) => {
        return {
          ...prev,
          density: 'comfortable',
        };
      });
    }
  }, [isMobile]);

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

  const mobileProps = {
    renderDetailPanel: ({row}) => (
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
    ),
    muiTableHeadCellProps: {
      sx: {
        flex: '0 0 auto',
        fontSize: '0.8rem',
        // minWidth: '15px',
      },
    },
    muiTableBodyCellProps: {
      sx: {
        flex: '0 0 auto',
        fontSize: '0.8rem',
        textWrap: 'wrap',
        // minWidth: '15px',
      },
    },
    enableColumnActions: false,
    muiTableBodyRowProps: ({row}) => ({
      onClick: (event) => {
        row.toggleExpanded();
      },
      sx: {
        cursor: 'pointer',
      },
    }),
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <MaterialReactTable
      // muiTableBodyCellProps={{sx: {fontSize: '0.8rem'}}}
      data={data}
      columns={isTouch ? mobileColumns : columns}
      // enableBottomToolbar={false}
      // enablePagination={false}
      // enableRowVirtualization
      muiTablePaperProps={{sx: {ml: -2, mr: -2}}}
      muiTableContainerProps={{sx: {maxHeight: 'calc(100dvh - 300px)', maxWidth: '100%'}}}
      muiTableHeadProps={{sx: {backgroundColor: 'primary.main'}}}
      localization={MRT_Localization_DA}
      positionGlobalFilter="left" //show the global filter on the left side of the top toolbar
      initialState={{
        showGlobalFilter: true, //show the global filter by default
        pagination: {
          pageSize: isTouch ? 5 : 10,
        },
      }}
      globalFilterFn="fuzzy"
      enableGlobalFilterRankedResults={true}
      muiSearchTextFieldProps={{
        variant: 'outlined',
        size: 'small',
        sx: {
          maxWidth: '100%',
        },
      }}
      enableStickyFooter
      state={tableState}
      onColumnFiltersChange={stateChangeHandler('columnFilters')}
      onColumnVisibilityChange={stateChangeHandler('columnVisibility')}
      onDensityChange={stateChangeHandler('density')}
      onGlobalFilterChange={stateChangeHandler('globalFilter')}
      onShowColumnFiltersChange={stateChangeHandler('showColumnFilters')}
      onShowGlobalFilterChange={stateChangeHandler('showGlobalFilter')}
      onSortingChange={stateChangeHandler('sorting')}
      onPaginationChange={stateChangeHandler('pagination')}
      enableRowActions={true}
      renderRowActions={({row}) => (
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
          <Tooltip arrow title="Gå til kvalitetssikring" enterTouchDelay={0}>
            <IconButton
              size="small"
              sx={{backgroundColor: 'secondary.main'}}
              onClick={() => navigate(`/admin/kvalitetssikring/${row.original.ts_id}`)}
            >
              <AutoGraphIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      renderTopToolbar={({table}) => (
        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
          <Box maxWidth={'250px'}>
            <MRT_GlobalFilterTextField table={table} />
          </Box>
          <Box>
            <Tooltip arrow title="Nulstil tabel">
              <IconButton onClick={() => setTableState(RESET)}>
                <RestartAltIcon />
              </IconButton>
            </Tooltip>
            {isTouch ? null : <MRT_ToggleFiltersButton table={table} />}
            {isTouch ? null : <MRT_ShowHideColumnsButton table={table} />}
          </Box>
        </Box>
      )}
      muiTablePaginationProps={{
        rowsPerPageOptions: [],
      }}
      enableExpanding={false}
      displayColumnDefOptions={{
        'mrt-row-actions': {
          header: '', //change header text
          // size: 20, //change size
        },
      }}
      {...(isTouch ? mobileProps : {})}
    />
  );
};

export default StationTable;
