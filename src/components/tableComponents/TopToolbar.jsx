import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {Box, IconButton, Tooltip} from '@mui/material';
import {
  MRT_GlobalFilterTextField,
  MRT_ShowHideColumnsButton,
  MRT_ToggleFiltersButton,
} from 'material-react-table';

import useBreakpoints from '~/hooks/useBreakpoints';

const TopToolbar = ({table}) => {
  const {isTouch} = useBreakpoints();
  return (
    <Box m={1} sx={{display: 'flex'}} justifyContent={'flex-end'}>
      <Box width={'100%'}>
        <MRT_GlobalFilterTextField table={table} />
      </Box>
      <Box alignSelf={'flex-end'}>
        <Tooltip arrow title="Nulstil tabel">
          <IconButton>
            <RestartAltIcon />
          </IconButton>
        </Tooltip>
        {isTouch ? null : <MRT_ToggleFiltersButton table={table} />}
        {isTouch ? null : <MRT_ShowHideColumnsButton table={table} />}
      </Box>
    </Box>
  );
};

export default TopToolbar;
