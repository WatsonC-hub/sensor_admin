import React from 'react';
import {SimpleLocationAccess} from '../types';
import {List} from '@mui/material';
import SimpleTextView from '~/components/SimpleTextView';

type Props = {
  values: SimpleLocationAccess[];
  onRemove: (index: number) => void;
};

const SimpleLocationAccessList = ({values, onRemove}: Props) => {
  return (
    <List sx={{maxWidth: 320, bgcolor: 'background.paper'}}>
      {values.map((contact, index) => (
        <SimpleTextView
          key={index}
          primaryText={contact.name}
          secondaryText={contact.type}
          onRemove={() => onRemove(index)}
        />
      ))}
    </List>
  );
};

export default SimpleLocationAccessList;
