import {Grid, Alert, Link} from '@mui/material';
import React from 'react';

import {alertHeight} from '~/consts';

type Props = {
  openAddMP: () => void;
};

const IngenMPAlert = ({openAddMP}: Props) => {
  return (
    <div>
      <Grid item xs={12} sm={12} display="flex" justifyContent="center">
        <Alert
          severity="error"
          sx={{
            justifyContent: 'center',
            display: 'flex',
            alignItems: 'center',
            height: alertHeight,
          }}
        >
          <Link component="button" variant="body2" color="error" onClick={openAddMP}>
            Tilføj venligst et målepunkt først
          </Link>
        </Alert>
      </Grid>
    </div>
  );
};

export default IngenMPAlert;
