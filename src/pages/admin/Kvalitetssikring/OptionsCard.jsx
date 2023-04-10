import React from 'react';
import {Card, CardContent, CardHeader, Button, Grid} from '@mui/material';

const OptionsCard = ({title, children, handleClick}) => {
  return (
    <Card
      sx={{
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        // borderRadius: 2,
        border: 1,
        borderColor: 'primary.main',
        width: 250,
        padding: 2,
      }}
    >
      <CardHeader title={title} sx={{textAlign: 'center'}} />
      <CardContent
        sx={{
          p: 1,
          m: 0,
        }}
      >
        <Grid container spacing={1} display="flex" justifyContent="center">
          <Grid item xs={12} sm={12}>
            {children}
          </Grid>
          <Grid item xs={12} sm={12}>
            <Button
              color="secondary"
              variant="contained"
              onClick={handleClick}
              //disabled={disablePreview}
            >
              Se preview
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default OptionsCard;
