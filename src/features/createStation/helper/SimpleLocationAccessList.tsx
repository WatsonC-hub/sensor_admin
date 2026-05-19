import React from 'react';
import {SimpleLocationAccess} from '../types';
import {List} from '@mui/material';
import SimpleTextView from '~/components/SimpleTextView';

type Props = {
  values: SimpleLocationAccess[] | undefined;
  onRemove: (index: number) => void;
};

const SimpleLocationAccessList = ({values, onRemove}: Props) => {
  return (
    <List disablePadding>
      {values === undefined && <SimpleTextView primaryText={'Adgangsnøgler registreres senere'} />}
      {Array.isArray(values) && values.length === 0 && (
        <SimpleTextView key="nokeys" primaryText={'Ingen adgangsnøgler tilføjet'} />
      )}
      {Array.isArray(values) &&
        values.map((contact, index) => (
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
