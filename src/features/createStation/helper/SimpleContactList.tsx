import React from 'react';
import {SimpleContact} from '../types';
import {List} from '@mui/material';
import SimpleTextView from '~/components/SimpleTextView';

type Props = {
  values: SimpleContact[] | undefined;
  onRemove: (index: number) => void;
  warning?: React.ReactNode;
};

const SimpleContactList = ({values, onRemove, warning}: Props) => {
  return (
    <List sx={{maxWidth: 320, bgcolor: 'background.paper'}}>
      {values === undefined && <SimpleTextView primaryText={'Kontakter registreres senere'} />}
      {Array.isArray(values) && values.length === 0 && (
        <SimpleTextView
          key="nocontact"
          primaryText={'Ingen kontakter tilføjet'}
          secondaryText={warning}
        />
      )}
      {Array.isArray(values) &&
        values.map((contact, index) => (
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
