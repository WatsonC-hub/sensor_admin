import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {Box, IconButton, Tooltip} from '@mui/material';
import {useAtom} from 'jotai';
import {RESET} from 'jotai/utils';
import {
  MRT_GlobalFilterTextField,
  MRT_ShowHideColumnsButton,
  MRT_ToggleFiltersButton,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';
import React, {useEffect} from 'react';

import useBreakpoints from '~/hooks/useBreakpoints';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
// import {stationTableAtom} from '~/state/atoms';

const TableComponent = ({data, columns, ...rest}) => {
  const [tableState, setTableState] = useStatefullTableAtom('testtable');
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
      console.log('Mobile');
      setTableState((prev) => {
        return {
          ...prev,
          density: 'compact',
          columnVisibility: {
            ts_id: false,
            'mrt-row-expand': true,
          },
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
  }, [isMobile, setTableState]);

  const table = useMaterialReactTable({
    columns,
    data,
    ...rest,
    state: tableState,
    localization: MRT_Localization_DA,
    onColumnFiltersChange: stateChangeHandler('columnFilters'),
    onColumnVisibilityChange: stateChangeHandler('columnVisibility'),
    onDensityChange: stateChangeHandler('density'),
    onGlobalFilterChange: stateChangeHandler('globalFilter'),
    onShowColumnFiltersChange: stateChangeHandler('showColumnFilters'),
    onShowGlobalFilterChange: stateChangeHandler('showGlobalFilter'),
    onSortingChange: stateChangeHandler('sorting'),
    onPaginationChange: stateChangeHandler('pagination'),
    renderTopToolbar: ({table}) => (
      <Box m={1} sx={{display: 'flex'}} justifyContent={'flex-end'}>
        <Box width={'100%'}>
          <MRT_GlobalFilterTextField table={table} />
        </Box>
        <Box alignSelf={'flex-end'}>
          <Tooltip arrow title="Nulstil tabel">
            <IconButton onClick={() => setTableState(RESET)}>
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
          {isTouch ? null : <MRT_ToggleFiltersButton table={table} />}
          {isTouch ? null : <MRT_ShowHideColumnsButton table={table} />}
        </Box>
      </Box>
    ),
  });

  return <MaterialReactTable table={table} />;
};

export default TableComponent;
