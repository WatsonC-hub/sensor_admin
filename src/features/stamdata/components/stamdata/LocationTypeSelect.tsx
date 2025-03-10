import {MenuItem} from '@mui/material';
import React from 'react';

import FormInput from '~/components/FormInput';
import useLocationType from '../../api/useLocationType';

interface LocationTypeSelectProps {
  disable: boolean;
}

export default function LocationTypeSelect({disable}: LocationTypeSelectProps) {
  const {
    get: {data},
  } = useLocationType();

  return (
    <FormInput
      name="location.loctype_id"
      label="Lokationstype"
      select
      required
      fullWidth
      disabled={disable}
    >
      <MenuItem value={-1} key={-1}>
        Vælg type
      </MenuItem>
      {data?.map((item) => (
        <MenuItem value={item.loctype_id} key={item.loctype_id}>
          {item.loctypename}
        </MenuItem>
      ))}
    </FormInput>
  );
}
