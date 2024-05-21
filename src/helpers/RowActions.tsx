import {Box, IconButton} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Props {
  canEdit?: boolean;
  handleEdit: ({}) => void;
  handleDelete: (gid: number) => void;
}

const RenderActions = ({handleEdit, handleDelete, canEdit}: Props, {row, table}: any) => [
  <Box display="flex" justifyContent="flex-end">
    <IconButton
      edge="end"
      onClick={() => {
        handleEdit(row.original);
      }}
      disabled={!canEdit}
      size="large"
    >
      <EditIcon />
    </IconButton>
    <IconButton
      edge="end"
      onClick={() => {
        handleDelete(row.original.gid);
      }}
      disabled={!canEdit}
      size="large"
      style={{marginRight: '2px'}}
    >
      <DeleteIcon />
    </IconButton>
  </Box>,
];

export default RenderActions;
