import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {Box, IconButton, Tooltip} from '@mui/material';
import {
  MRT_RowData,
  MRT_TableInstance,
  MRT_ToggleFiltersButton,
  MRT_ShowHideColumnsButton,
} from 'material-react-table';
import useBreakpoints from '~/hooks/useBreakpoints';

const RenderInternalActions = <TData extends MRT_RowData>({
  table,
  reset,
}: {
  table: MRT_TableInstance<TData>;
  reset?: () => void;
}) => {
  const {isTouch} = useBreakpoints();
  return (
    <Box alignSelf={'flex-end'}>
      {reset ? (
        <Tooltip arrow title="Nulstil tabel">
          <IconButton onClick={reset}>
            <RestartAltIcon />
          </IconButton>
        </Tooltip>
      ) : null}

      {isTouch ? null : <MRT_ToggleFiltersButton table={table} />}
      {isTouch ? null : <MRT_ShowHideColumnsButton table={table} />}
    </Box>
  );
};

export default RenderInternalActions;
