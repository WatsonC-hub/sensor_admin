import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {Box, IconButton, Tooltip} from '@mui/material';
import {MRT_RowData, MRT_TableInstance} from 'material-react-table';

const RenderInternalActions = <TData extends MRT_RowData>({
  reset,
}: {
  table: MRT_TableInstance<TData>;
  reset: () => void;
}) => {
  return (
    <Box alignSelf={'flex-end'}>
      <Tooltip arrow title="Nulstil tabel">
        <IconButton onClick={reset}>
          <RestartAltIcon />
        </IconButton>
      </Tooltip>
      {/* {isTouch ? null : <MRT_ToggleFiltersButton table={table} />}
      {isTouch ? null : <MRT_ShowHideColumnsButton table={table} />} */}
    </Box>
  );
};

export default RenderInternalActions;
