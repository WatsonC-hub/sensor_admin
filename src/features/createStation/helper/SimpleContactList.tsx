import React from 'react';
import {SimpleContact} from '../types';
import {List} from '@mui/material';
import SimpleTextView from '~/components/SimpleTextView';

type Props = {
  values: SimpleContact[] | undefined;
  onRemove: (contact_id: string) => void;
};

const SimpleContactList = ({values, onRemove}: Props) => {
  return (
    <List disablePadding>
      {values === undefined && <SimpleTextView primaryText={'Kontakter registreres senere'} />}
      {Array.isArray(values) && values.length === 0 && (
        <SimpleTextView key="nocontact" primaryText={'Ingen kontakter tilføjet'} />
      )}
      {Array.isArray(values) &&
        values.map((contact, index) => {
          return (
            <SimpleTextView
              key={index}
              primaryText={contact.name}
              secondaryText={contact.email}
              onRemove={() => onRemove(contact.id)}
              disabled={
                contact.contact_role === 1 && contact.contact_type === 'projekt' && !!contact.id
              }
            />
          );
        })}
    </List>
  );
};

export default SimpleContactList;
