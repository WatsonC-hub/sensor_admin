import React, {useMemo} from 'react';
import {Button, Box, Tooltip, IconButton, Typography} from '@mui/material';
import {
  MaterialReactTable,
  MRT_ShowHideColumnsButton,
  MRT_ToggleFiltersButton,
  MRT_GlobalFilterTextField,
  MRT_TablePagination,
} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {stationTableAtom} from 'src/state/atoms';
import {useAtom} from 'jotai';
import {RESET} from 'jotai/utils';
import {useNavigate} from 'react-router-dom';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import useBreakpoints from 'src/hooks/useBreakpoints';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SignalCellularConnectedNoInternet0BarRoundedIcon from '@mui/icons-material/SignalCellularConnectedNoInternet0BarRounded';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import HeightIcon from '@mui/icons-material/Height';

function statusIcon(color, active, task) {
  if (!active) {
    return <CheckCircleIcon style={{color: 'grey'}} />;
  }

  switch (task) {
    case 'Ok':
      return <CheckCircleIcon style={{color: 'mediumseagreen'}} />;
    case null:
      return <CheckCircleIcon style={{color: 'mediumseagreen'}} />;
    case 'Sender ikke':
    case 'Sender null':
      return <SignalCellularConnectedNoInternet0BarRoundedIcon style={{color: color}} />;
    case 'Batterskift':
      return <BatteryAlertIcon style={{color: color}} />;
    case 'Tilsyn':
      return <BuildRoundedIcon style={{color: color}} />;
    case 'Pejling':
      return <HeightIcon style={{color: color}} />;
    default:
      return <PriorityHighIcon style={{color: color}} />;
  }
}

const StationTable = ({data, isLoading}) => {
  const [tableState, setTableState] = useAtom(stationTableAtom);
  // const [tableState, setTableState] = React.useState({});
  const {isTouch, isMobile} = useBreakpoints();

  const navigate = useNavigate();

  const stateChangeHandler = (stateName) => (state) => {
    setTableState((prev) => ({
      ...prev,
      [stateName]: state instanceof Function ? state(prev[stateName]) : state,
    }));
  };

  const columns = useMemo(
    () => [
      {
        header: 'Tidsserie ID',
        accessorKey: 'ts_id',
        enableHide: false,
      },
      {
        header: 'Calypso ID',
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
      },
      {
        header: 'Status',
        accessorKey: 'flag',
        Cell: ({row}) => statusIcon(row.original.color, row.original.active, row.original.opgave),
      },
    ],
    []
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <MaterialReactTable
      data={data}
      columns={columns}
      // enableBottomToolbar={false}
      // enablePagination={false}
      // enableRowVirtualization
      muiTablePaperProps={{sx: {ml: -2, mr: -2}}}
      muiTableContainerProps={{sx: {height: 'calc(100vh - 300px)'}}}
      muiTableHeadProps={{sx: {backgroundColor: 'primary.main'}}}
      localization={MRT_Localization_DA}
      positionGlobalFilter="left" //show the global filter on the left side of the top toolbar
      initialState={{
        showGlobalFilter: true, //show the global filter by default
      }}
      muiTableBodyRowProps={({row}) => ({
        onDoubleClick: (event) => {
          navigate(`/field/location/${row.original.loc_id}/${row.original.ts_id}`);
        },
        sx: {
          cursor: 'pointer',
        },
      })}
      globalFilterFn="fuzzy"
      enableGlobalFilterRankedResults={true}
      muiSearchTextFieldProps={{
        variant: 'outlined',
        size: 'small',
        sx: {
          maxWidth: '100%',
        },
      }}
      state={tableState}
      onColumnFiltersChange={stateChangeHandler('columnFilters')}
      onColumnVisibilityChange={stateChangeHandler('columnVisibility')}
      onDensityChange={stateChangeHandler('density')}
      onGlobalFilterChange={stateChangeHandler('globalFilter')}
      onShowColumnFiltersChange={stateChangeHandler('showColumnFilters')}
      onShowGlobalFilterChange={stateChangeHandler('showGlobalFilter')}
      onSortingChange={stateChangeHandler('sorting')}
      enableRowActions={true}
      renderRowActions={({row}) => (
        <Box>
          <Tooltip arrow title="Gå til tidsserie">
            <IconButton
              onClick={() => {
                navigate(`/field/location/${row.original.loc_id}/${row.original.ts_id}`);
              }}
            >
              <QueryStatsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title="Gå til kvalitetssikring">
            <IconButton onClick={() => navigate(`/admin/kvalitetssikring/${row.original.ts_id}`)}>
              <AutoGraphIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      renderDetailPanel={
        isTouch &&
        (({row}) => (
          <Box
            sx={{
              display: 'grid',
              margin: 'auto',
              gridTemplateColumns: '1fr 1fr',
              width: '100%',
            }}
          >
            <Typography>Address: {row.original.opgave}</Typography>
          </Box>
        ))
      }
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
            <MRT_ToggleFiltersButton table={table} />
            <MRT_ShowHideColumnsButton table={table} />
          </Box>
        </Box>
      )}
      muiTablePaginationProps={{
        rowsPerPageOptions: [],
      }}
      displayColumnDefOptions={{
        'mrt-row-actions': {
          header: '', //change header text
          size: 20, //change size
        },
      }}
    />
  );
};

export default StationTable;
