import React from 'react';
import StamdataLocation from '../StamdataLocation';
import {Grid} from '@mui/material';
import {useUser} from '~/features/auth/useUser';
import type {FormInputProps} from '~/components/FormInput';
import type {BoreholeAddLocation} from '~/features/station/schema';
import type {AutoCompleteFieldProps} from '~/components/Autocomplete';
import type {Borehole} from '~/features/station/api/useBorehole';

type Props = {
  size: number;
  loc_id?: number;
  slotProps?: {
    loctypeSelect?: Omit<FormInputProps<BoreholeAddLocation>, 'name'>;
    boreholeno?: Partial<AutoCompleteFieldProps<Borehole>> & {
      editing?: boolean;
    };
  };
};

const BoreholeLocationForm = ({size, loc_id, slotProps}: Props) => {
  const {superUser} = useUser();
  const disabled = loc_id !== undefined;

  return (
    <Grid container spacing={2}>
      <Grid size={size}>
        <StamdataLocation.LoctypeSelect disabled={disabled} {...slotProps?.loctypeSelect} />
      </Grid>
      <Grid size={size}>
        <StamdataLocation.Boreholeno disabled={disabled} {...slotProps?.boreholeno} />
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

export default BoreholeLocationForm;
