import React from 'react';
import {SimpleContact} from '../types';
import {List} from '@mui/material';
import SimpleTextView from '~/components/SimpleTextView';

type Props = {
  values: SimpleContact[];
  onRemove: (index: number) => void;
};

const SimpleContactList = ({values, onRemove}: Props) => {
  return (
    <List sx={{maxWidth: 320, bgcolor: 'background.paper'}}>
      {values.length === 0 && (
        <SimpleTextView
          key="nocontact"
          primaryText={'Ingen kontakter tilføjet'}
          secondaryText={'Der er taget stilling til kontakter ikke er relevante'}
        />
      )}
      {values.map((contact, index) => (
        <SimpleTextView
          key={index}
          primaryText={contact.name}
          secondaryText={contact.email}
          onRemove={() => onRemove(index)}
        />
      ))}
    </List>
  );
};

export default SimpleContactList;
