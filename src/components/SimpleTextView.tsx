import {RemoveCircleOutline} from '@mui/icons-material';
import {IconButton, ListItem, ListItemText} from '@mui/material';
import React, {ReactNode} from 'react';

type Props = {
  primaryText: ReactNode | string;
  secondaryText?: ReactNode | string;
  icon?: ReactNode;
  onRemove?: () => void;
};

const SimpleTextView = ({primaryText, secondaryText, icon, onRemove}: Props) => {
  return (
    <ListItem disableGutters sx={{p: 0}}>
      {onRemove && (
        <IconButton aria-label="remove contact" size="small" edge="start">
          <RemoveCircleOutline
            color="primary"
            fontSize="small"
            onClick={() => {
              onRemove();
            }}
          />
        </IconButton>
      )}
      {icon}
      <ListItemText sx={{pl: 1}} primary={primaryText} secondary={secondaryText} />
    </ListItem>
  );
};

export default SimpleTextView;
