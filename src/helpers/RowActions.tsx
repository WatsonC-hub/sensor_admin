import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {Box, IconButton} from '@mui/material';
import React from 'react';

interface Props {
  canEdit?: boolean;
  handleEdit?: () => void;
  onDeleteBtnClick?: () => void;
}

const RenderActions = ({handleEdit, onDeleteBtnClick, canEdit}: Props) => {
  return (
    <Box margin="0 auto" display="flex" justifyContent="flex-end">
      {handleEdit && (
        <IconButton sx={{p: 1}} edge="end" onClick={handleEdit} disabled={!canEdit} size="large">
          <EditIcon />
        </IconButton>
      )}
      {onDeleteBtnClick && (
        <IconButton
          edge="end"
          onClick={onDeleteBtnClick}
          disabled={!canEdit}
          size="large"
          style={{marginRight: '2px'}}
        >
          <DeleteIcon />
        </IconButton>
      )}
    </Box>
  );
};
export default RenderActions;
