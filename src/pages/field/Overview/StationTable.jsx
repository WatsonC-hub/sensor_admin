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
import useBreakpoints from 'src/hooks/useBreakpoints';

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
          <Tooltip arrow title="Gå til kvalitetssikring">
            <IconButton onClick={() => navigate(`/admin/kvalitetssikring/${row.original.ts_id}`)}>
              <AutoGraphIcon />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title="Expand">
            <IconButton onClick={() => row.toggleExpanded()}>
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
            <Tooltip arrow title="Reset">
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
    />
  );
};

export default StationTable;
