import React from 'react';
import {SimpleContact} from '../types';
import {List, ListItem, ListItemText, IconButton} from '@mui/material';
import {RemoveCircleOutline} from '@mui/icons-material';

type Props = {
  values: SimpleContact[];
  onRemove: (index: number) => void;
};

const SimpleContactList = ({values, onRemove}: Props) => {
  return (
    <List sx={{maxWidth: 320, bgcolor: 'background.paper'}}>
      {values.map((contact, index) => (
        <ListItem key={index} disableGutters>
          <IconButton aria-label="remove contact" size="small" edge="start">
            <RemoveCircleOutline
              color="primary"
              fontSize="small"
              onClick={() => {
                onRemove(index);
              }}
            />
          </IconButton>
          <ListItemText primary={contact.name} secondary={contact.email} />
        </ListItem>
      ))}
    </List>
  );
};

export default SimpleContactList;
