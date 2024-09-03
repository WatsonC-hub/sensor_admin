import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {Box, IconButton, Tooltip} from '@mui/material';
// import {useAtom} from 'jotai';
// import {RESET} from 'jotai/utils';
import {
  MRT_GlobalFilterTextField,
  MRT_ShowHideColumnsButton,
  MRT_ToggleFiltersButton,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import {MRT_Localization_DA} from 'material-react-table/locales/da';
import React from 'react';

import useBreakpoints from '~/hooks/useBreakpoints';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
// import {stationTableAtom} from '~/state/atoms';

const TableComponent = ({data, columns, ...rest}) => {
  const [stateAndHandlers, resetState] = useStatefullTableAtom('testtable');
  const {isTouch} = useBreakpoints();

  const table = useMaterialReactTable({
    columns,
    data,
    ...rest,
    localization: MRT_Localization_DA,
    ...stateAndHandlers,
    renderTopToolbar: ({table}) => (
      <Box m={1} sx={{display: 'flex'}} justifyContent={'flex-end'}>
        <Box width={'100%'}>
          <MRT_GlobalFilterTextField table={table} />
        </Box>
        <Box alignSelf={'flex-end'}>
          <Tooltip arrow title="Nulstil tabel">
            <IconButton onClick={resetState}>
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
