import React from 'react';
import {SimpleContact} from '../types';
import {List, ListItem, ListItemIcon, ListItemText, Box, ListItemButton} from '@mui/material';
import {Delete, Edit, Person} from '@mui/icons-material';

type Props = {
  values: SimpleContact[];
  onRemove: (index: number) => void;
  onEdit: (index: number) => void;
};

const SimpleContactList = ({values, onRemove, onEdit}: Props) => {
  return (
    <List sx={{maxWidth: 360, bgcolor: 'background.paper'}}>
      {values.map((contact, index) => (
        <ListItem key={index} sx={{px: 1, width: '100%'}} disableGutters disablePadding>
          <ListItemIcon sx={{minWidth: '15%'}}>
            <Person sx={{color: 'grey.700'}} />
          </ListItemIcon>
          <ListItemText sx={{width: '100%'}} primary={contact.name} secondary={contact.email} />
          <Box display={'flex'} gap={0.5} mb={1}>
            <ListItemButton disableGutters sx={{width: 'fit-content'}}>
              <Edit
                sx={{color: 'grey.700'}}
                onClick={() => {
                  onEdit(index);
                }}
              />
            </ListItemButton>
            <ListItemButton disableGutters sx={{width: 'fit-content'}}>
              <Delete
                sx={{color: 'grey.700'}}
                onClick={() => {
                  onRemove(index);
                }}
              />
            </ListItemButton>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default SimpleContactList;
