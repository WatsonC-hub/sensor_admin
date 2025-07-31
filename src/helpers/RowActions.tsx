import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {Box, IconButton} from '@mui/material';
import React from 'react';

interface Props {
  disabled?: boolean;
  handleEdit: () => void;
  onDeleteBtnClick?: () => void;
}

const RenderActions = ({handleEdit, onDeleteBtnClick, disabled}: Props) => {
  return (
    <Box margin="0 auto" display="flex" justifyContent="flex-end">
      <IconButton edge="end" onClick={handleEdit} disabled={disabled} size="large">
        <EditIcon />
      </IconButton>
      {onDeleteBtnClick && (
        <IconButton
          edge="end"
          onClick={onDeleteBtnClick}
          disabled={disabled}
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
