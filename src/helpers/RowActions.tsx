import {Box, IconButton} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import React from 'react';

interface Props {
  canEdit?: boolean;
  handleEdit: () => void;
  onDeleteBtnClick: () => void;
}

const RenderActions = ({handleEdit, onDeleteBtnClick, canEdit}: Props) => {
  return (
    <Box margin="0 auto" display="flex" justifyContent="flex-end">
      <IconButton edge="end" onClick={handleEdit} disabled={!canEdit} size="large">
        <EditIcon />
      </IconButton>
      <IconButton
        edge="end"
        onClick={onDeleteBtnClick}
        disabled={!canEdit}
        size="large"
        style={{marginRight: '2px'}}
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};
export default RenderActions;
