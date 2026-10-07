import {Grid} from '@mui/material';
import React from 'react';

import {useUser} from '~/features/auth/useUser';
import usePermissions from '~/features/permissions/api/usePermissions';

import StamdataLocation from '../StamdataLocation';

type Props = {
  size: number;
  loc_id: number | undefined;
};

const BoreholeLocationEditForm = ({size, loc_id}: Props) => {
  const {superUser} = useUser();
  const {location_permissions} = usePermissions(loc_id);
  const disabled = location_permissions !== 'edit';

  return (
    <Grid container spacing={2}>
      <Grid size={size}>
        <StamdataLocation.LoctypeSelect disabled={disabled} />
      </Grid>
      {superUser && <Grid size={size}></Grid>}
      <Grid size={size}>
        <StamdataLocation.Boreholeno
          disabled={disabled}
          editing={true}
          // fieldDescriptionText="Borehole number"
        />
      </Grid>
      <Grid size={size}>
        <StamdataLocation.BoreholeSuffix disabled={disabled} />
      </Grid>
      <Grid size={size}>
        <StamdataLocation.Groups disabled={disabled} />
      </Grid>
      {superUser && (
        <Grid size={size}>
          <StamdataLocation.InitialProjectNo disabled={disabled} />
        </Grid>
      )}
      <Grid size={size}>
        <StamdataLocation.X disabled={disabled} />
      </Grid>
      <Grid size={size}>
        <StamdataLocation.Y disabled={disabled} />
      </Grid>
      <Grid
        size={size}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
        }}
      >
        <Grid size={9}>
          <StamdataLocation.TerrainQuote disabled={disabled} />
        </Grid>
        <Grid size={3}>
          <StamdataLocation.TerrainQuality disabled={disabled} />
        </Grid>
      </Grid>
      <Grid size={size}>
        <StamdataLocation.Description disabled={disabled} />
      </Grid>
      <Grid
        size={size}
        sx={{
          alignContent: 'center',
        }}
      >
        <StamdataLocation.LocationID />
      </Grid>
    </Grid>
  );
};

export default BoreholeLocationEditForm;
