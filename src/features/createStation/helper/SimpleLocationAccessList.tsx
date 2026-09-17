import {List} from '@mui/material';
import React from 'react';

import SimpleTextView from '~/components/SimpleTextView';

import type {SimpleLocationAccess} from '../types';

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
        values.map((location_access, index) => (
          <SimpleTextView
            key={location_access.name + location_access.type}
            primaryText={location_access.name}
            secondaryText={location_access.type}
            onRemove={() => onRemove(index)}
          />
        ))}
    </List>
  );
};

export default SimpleLocationAccessList;
