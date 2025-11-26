import {Grid2} from '@mui/material';
import React from 'react';
import StamdataLocation from '../StamdataLocation';
import {useUser} from '~/features/auth/useUser';
import {FormInputProps} from '~/components/FormInput';
import {DefaultAddLocation} from '~/features/station/schema';
import {AutoCompleteFieldProps} from '~/components/Autocomplete';
import {Borehole} from '~/features/station/api/useBorehole';

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
    <Grid2 container spacing={2}>
      <Grid2 size={size}>
        <StamdataLocation.LoctypeSelect disabled={disabled} {...slotProps?.loctypeSelect} />
      </Grid2>
      <Grid2 size={size}></Grid2>
      <Grid2 size={size}>
        <StamdataLocation.Locname disabled={disabled} {...slotProps?.loc_name} />
      </Grid2>
      {superUser && <Grid2 size={size}></Grid2>}
      <Grid2 size={size}>
        <StamdataLocation.Groups
          disabled={disabled}
          // fieldDescriptionText="En gruppe er et linkbart navn på en kollektion af lokationer som f.eks. kan sorteres på i kortet. Under stamdata på en lokation kan du klikke på gruppenavnet for at blive viderestillet til en side med et overblik over alle lokationer i gruppen."
        />
      </Grid2>
      {superUser && (
        <Grid2 size={size}>
          <StamdataLocation.InitialProjectNo disabled={disabled} />
        </Grid2>
      )}
      <Grid2 size={size}>
        <StamdataLocation.X disabled={disabled} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.Y disabled={disabled} />
      </Grid2>
      <Grid2 display={'flex'} flexDirection={'row'} size={size} gap={2}>
        <Grid2 size={9}>
          <StamdataLocation.TerrainQuote disabled={disabled} />
        </Grid2>
        <Grid2 size={3}>
          <StamdataLocation.TerrainQuality disabled={disabled} />
        </Grid2>
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.Description disabled={disabled} />
      </Grid2>
    </Grid2>
  );
};

export default DefaultLocationForm;
