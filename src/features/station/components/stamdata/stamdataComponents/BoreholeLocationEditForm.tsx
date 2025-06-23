import {Grid2} from '@mui/material';
import React from 'react';
import StamdataLocation from '../StamdataLocation';
import usePermissions from '~/features/permissions/api/usePermissions';
import {useUser} from '~/features/auth/useUser';

type Props = {
  size: number;
  loc_id: number | undefined;
};

const BoreholeLocationEditForm = ({size, loc_id}: Props) => {
  const user = useUser();
  const {location_permissions} = usePermissions(loc_id);
  const disabled = location_permissions !== 'edit';

  return (
    <Grid2 container spacing={2}>
      <Grid2 size={size}>
        <StamdataLocation.LoctypeSelect disabled={disabled} />
      </Grid2>
      {user?.superUser && <Grid2 size={size}></Grid2>}
      <Grid2 size={size}>
        <StamdataLocation.Boreholeno
          disabled={disabled}
          // fieldDescriptionText="Borehole number"
        />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.BoreholeSuffix disabled={disabled} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.Groups disabled={disabled} />
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
      <Grid2 size={size} alignContent={'center'}>
        <StamdataLocation.LocationID />
      </Grid2>
    </Grid2>
  );
};

export default BoreholeLocationEditForm;
