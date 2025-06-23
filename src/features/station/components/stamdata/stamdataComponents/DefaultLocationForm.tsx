import {Grid2} from '@mui/material';
import React from 'react';
import StamdataLocation from '../StamdataLocation';
import {useUser} from '~/features/auth/useUser';

type Props = {
  size: number;
  loc_id: number | undefined; // Optional prop for location ID
};

const DefaultLocationForm = ({size, loc_id}: Props) => {
  const user = useUser();
  const disabled = loc_id !== undefined;

  return (
    <Grid2 container spacing={2}>
      <Grid2 size={size}>
        <StamdataLocation.LoctypeSelect disabled={disabled} />
      </Grid2>
      <Grid2 size={size}></Grid2>
      <Grid2 size={size}>
        <StamdataLocation.Locname disabled={disabled} />
      </Grid2>
      {user?.superUser && <Grid2 size={size}></Grid2>}
      <Grid2 size={size}>
        <StamdataLocation.Groups
          disabled={disabled}
          // fieldDescriptionText="En gruppe er et linkbart navn på en kollektion af lokationer som f.eks. kan sorteres på i kortet. Under stamdata på en lokation kan du klikke på gruppenavnet for at blive viderestillet til en side med et overblik over alle lokationer i gruppen."
        />
      </Grid2>
      {user?.superUser && (
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
