import React from 'react';
import {SimpleLocationAccess} from '../types';
import {List} from '@mui/material';
import SimpleTextView from '~/components/SimpleTextView';

type Props = {
  values: SimpleLocationAccess[];
  onRemove: (index: number) => void;
  warning?: React.ReactNode;
};

const SimpleLocationAccessList = ({values, onRemove, warning}: Props) => {
  return (
    <List sx={{maxWidth: 320, bgcolor: 'background.paper'}}>
      {values.length === 0 && (
        <SimpleTextView
          key="nokeys"
          primaryText={'Ingen adgangsnøgler tilføjet'}
          secondaryText={warning}
        />
      )}
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
