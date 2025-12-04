import React from 'react';
import StamdataLocation from '../StamdataLocation';
import {Grid2} from '@mui/material';
import {useUser} from '~/features/auth/useUser';
import {FormInputProps} from '~/components/FormInput';
import {BoreholeAddLocation} from '~/features/station/schema';
import {AutoCompleteFieldProps} from '~/components/Autocomplete';
import {Borehole} from '~/features/station/api/useBorehole';

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
    <Grid2 container spacing={2}>
      <Grid2 size={size}>
        <StamdataLocation.LoctypeSelect disabled={disabled} {...slotProps?.loctypeSelect} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.Boreholeno disabled={disabled} {...slotProps?.boreholeno} />
      </Grid2>
      {superUser && (
        <Grid2 size={size}>
          <StamdataLocation.InitialProjectNo disabled={disabled} />
        </Grid2>
      )}
      <Grid2 display={'flex'} flexDirection={'row'} size={size} gap={2}>
        <Grid2 size={6}>
          <StamdataLocation.X disabled={disabled} />
        </Grid2>
        <Grid2 size={6}>
          <StamdataLocation.Y disabled={disabled} />
        </Grid2>
      </Grid2>
      <Grid2 display={'flex'} flexDirection={'row'} size={size} gap={2}>
        <Grid2 size={8}>
          <StamdataLocation.TerrainQuote disabled={disabled} />
        </Grid2>
        <Grid2 size={4}>
          <StamdataLocation.TerrainQuality disabled={disabled} />
        </Grid2>
      </Grid2>
    </Grid2>
  );
};

export default BoreholeLocationForm;
