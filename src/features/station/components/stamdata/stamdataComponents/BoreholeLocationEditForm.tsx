import {Grid2} from '@mui/material';
import React from 'react';
import StamdataLocation from '../StamdataLocation';
import {useAppContext} from '~/state/contexts';
import usePermissions from '~/features/permissions/api/usePermissions';

type Props = {
  size: number;
};

const BoreholeLocationEditForm = ({size}: Props) => {
  const {loc_id} = useAppContext([], ['loc_id']);
  const {location_permissions} = usePermissions(loc_id);
  const disabled = location_permissions !== 'edit';

  console.log(disabled);

  return (
    <Grid2 container spacing={2}>
      <Grid2 size={size}>
        <StamdataLocation.LoctypeSelect disabled={disabled} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.Boreholeno disabled={disabled} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.BoreholeSuffix disabled={disabled} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.InitialProjectNo disabled={disabled} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.Groups disabled={disabled} />
      </Grid2>
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

export default BoreholeLocationEditForm;
