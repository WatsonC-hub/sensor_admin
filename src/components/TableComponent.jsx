import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {Box, IconButton, Tooltip} from '@mui/material';
import {useAtom} from 'jotai';
import {RESET} from 'jotai/utils';
import {
  MRT_GlobalFilterTextField,
  MRT_ShowHideColumnsButton,
  MRT_ToggleFiltersButton,
  MaterialReactTable,
} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';
import React, {useEffect} from 'react';
import useBreakpoints from '~/hooks/useBreakpoints';

const TableComponent = ({
  data,
  isLoading,
  columns,
  renderDetailPanel,
  rowActions,
  tableStateAtom,
}) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }
  const [tableState, setTableState] = useAtom(tableStateAtom);
  const {isTouch, isMobile} = useBreakpoints();

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

  const mobileProps = {
    renderDetailPanel: renderDetailPanel,
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

  return (
    <MaterialReactTable
      data={data}
      columns={columns}
      // muiTablePaperProps={{sx: {ml: -2, mr: -2}}}
      muiTableContainerProps={{sx: {maxWidth: '100%'}}}
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
      renderRowActions={rowActions}
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

export default TableComponent;
