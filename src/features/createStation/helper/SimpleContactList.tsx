import React from 'react';
import {SimpleContact} from '../types';
import {List, ListItem, ListItemIcon, ListItemText, IconButton} from '@mui/material';
import {Person, RemoveCircleOutline} from '@mui/icons-material';

type Props = {
  values: SimpleContact[];
  onRemove: (index: number) => void;
};

const SimpleContactList = ({values, onRemove}: Props) => {
  return (
    <List sx={{maxWidth: 320, bgcolor: 'background.paper'}}>
      {values.map((contact, index) => (
        <ListItem key={index} disableGutters>
          <ListItemIcon sx={{minWidth: '15%'}}>
            <Person sx={{color: 'grey.700'}} />
          </ListItemIcon>
          <ListItemText primary={contact.name} secondary={contact.email} />
          <IconButton aria-label="remove contact" size="small">
            <RemoveCircleOutline
              color="primary"
              fontSize="small"
              onClick={() => {
                onRemove(index);
              }}
            />
          </IconButton>
        </ListItem>
      ))}
    </List>
  );
};

export default SimpleContactList;
