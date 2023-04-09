import React from 'react';
import {Card, CardContent, CardHeader, Button, Grid} from '@mui/material';

const OptionsCard = ({title, children, handleClick}) => {
  return (
    <Card
      sx={{
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        borderRadius: 2,
        border: 2,
        borderColor: 'secondary.main',
        width: 250,
        marginRight: 1,
      }}
    >
      <CardHeader title={title} sx={{textAlign: 'center'}} />
      <CardContent
        sx={{
          p: 1,
          m: 0,
        }}
      >
        {children}
        <Grid item xs={12} sm={12} display="flex" justifyContent="center">
          <Button
            color="secondary"
            variant="contained"
            onClick={handleClick}
            //disabled={disablePreview}
          >
            Se preview
          </Button>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default OptionsCard;
