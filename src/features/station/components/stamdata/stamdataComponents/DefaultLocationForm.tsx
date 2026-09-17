import {Grid} from '@mui/material';
import React from 'react';

import {useUser} from '~/features/auth/useUser';

import StamdataLocation from '../StamdataLocation';

import type {AutoCompleteFieldProps} from '~/components/Autocomplete';
import type {FormInputProps} from '~/components/FormInput';
import type {Borehole} from '~/features/station/api/useBorehole';
import type {DefaultAddLocation} from '~/features/station/schema';

type Props = {
  size: number;
  loc_id: number | undefined; // Optional prop for location ID
  slotProps?: {
    loctypeSelect?: Omit<FormInputProps<DefaultAddLocation>, 'name'>;
    loc_name?: Omit<FormInputProps<DefaultAddLocation>, 'name'>;
    boreholeno?: Partial<AutoCompleteFieldProps<Borehole>> & {
      editing?: boolean;
    };
  };
};

const DefaultLocationForm = ({size, loc_id, slotProps}: Props) => {
  const {superUser} = useUser();
  const disabled = loc_id !== undefined;

  return (
    <Grid container spacing={2}>
      <Grid size={size}>
        <StamdataLocation.LoctypeSelect disabled={disabled} {...slotProps?.loctypeSelect} />
      </Grid>
      <Grid size={size}>
        <StamdataLocation.Locname disabled={disabled} {...slotProps?.loc_name} />
      </Grid>
      {superUser && (
        <Grid size={size}>
          <StamdataLocation.InitialProjectNo disabled={disabled} />
        </Grid>
      )}
      <Grid
        size={size}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
        }}
      >
        <Grid size={6}>
          <StamdataLocation.X disabled={disabled} />
        </Grid>
        <Grid size={6}>
          <StamdataLocation.Y disabled={disabled} />
        </Grid>
      </Grid>
      <Grid
        size={size}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
        }}
      >
        <Grid size={8}>
          <StamdataLocation.TerrainQuote disabled={disabled} />
        </Grid>
        <Grid size={4}>
          <StamdataLocation.TerrainQuality disabled={disabled} />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default DefaultLocationForm;
