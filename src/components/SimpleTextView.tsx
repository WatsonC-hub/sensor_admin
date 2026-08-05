import {RemoveCircleOutlined} from '@mui/icons-material';
import {IconButton, ListItem, ListItemText} from '@mui/material';
import type {ReactNode} from 'react';
import React from 'react';

type Props = {
  primaryText: ReactNode | string;
  secondaryText?: ReactNode | string;
  icon?: ReactNode;
  onRemove?: () => void;
  disabled?: boolean;
};

const SimpleTextView = ({primaryText, secondaryText, icon, onRemove, disabled}: Props) => {
  return (
    <ListItem disableGutters disablePadding>
      {onRemove && (
        <IconButton aria-label="remove contact" size="small" edge="start" disabled={disabled}>
          <RemoveCircleOutlined
            color={!disabled ? 'primary' : 'disabled'}
            fontSize="small"
            onClick={() => {
              onRemove();
            }}
          />
        </IconButton>
      )}
      {icon}
      <ListItemText
        primary={primaryText}
        secondary={secondaryText}
        slotProps={{
          primary: {
            color: disabled ? 'text.disabled' : undefined,
          },
          secondary: {
            color: disabled ? 'text.disabled' : undefined,
          },
        }}
      />
    </ListItem>
  );
};

export default SimpleTextView;
