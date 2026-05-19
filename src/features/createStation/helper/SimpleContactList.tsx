import React from 'react';
import {SimpleContact} from '../types';
import {List} from '@mui/material';
import SimpleTextView from '~/components/SimpleTextView';

type Props = {
  values: SimpleContact[] | undefined;
  onRemove: (index: number) => void;
};

const SimpleContactList = ({values, onRemove}: Props) => {
  return (
    <List disablePadding>
      {values === undefined && <SimpleTextView primaryText={'Kontakter registreres senere'} />}
      {Array.isArray(values) && values.length === 0 && (
        <SimpleTextView key="nocontact" primaryText={'Ingen kontakter tilføjet'} />
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
