import React from 'react';
import {SimpleLocationAccess} from '../types';
import {List, ListItem, ListItemText, IconButton} from '@mui/material';
import {RemoveCircleOutline} from '@mui/icons-material';

type Props = {
  values: SimpleLocationAccess[];
  onRemove: (index: number) => void;
};

const SimpleLocationAccessList = ({values, onRemove}: Props) => {
  return (
    <List sx={{maxWidth: 320, bgcolor: 'background.paper'}}>
      {values.map((contact, index) => (
        <ListItem key={index} disableGutters>
          <IconButton aria-label="remove location access" size="small" edge="start">
            <RemoveCircleOutline
              fontSize="small"
              color="primary"
              onClick={() => {
                onRemove(index);
              }}
            />
          </IconButton>
          <ListItemText primary={contact.name} secondary={contact.type} />
        </ListItem>
      ))}
    </List>
  );
};

export default SimpleLocationAccessList;
