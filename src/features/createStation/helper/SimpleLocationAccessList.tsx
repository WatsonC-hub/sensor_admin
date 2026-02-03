import React from 'react';
import {SimpleLocationAccess} from '../types';
import {List, ListItem, ListItemIcon, ListItemText, IconButton} from '@mui/material';
import {Person, RemoveCircleOutline} from '@mui/icons-material';

type Props = {
  values: SimpleLocationAccess[];
  onRemove: (index: number) => void;
};

const SimpleLocationAccessList = ({values, onRemove}: Props) => {
  return (
    <List sx={{maxWidth: 320, bgcolor: 'background.paper'}}>
      {values.map((contact, index) => (
        <ListItem key={index} disableGutters>
          <ListItemIcon sx={{minWidth: '15%'}}>
            <Person sx={{color: 'grey.700'}} />
          </ListItemIcon>
          <ListItemText primary={contact.name} secondary={contact.type} />
          <IconButton aria-label="remove location access" size="small">
            <RemoveCircleOutline
              fontSize="small"
              color="primary"
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

export default SimpleLocationAccessList;
