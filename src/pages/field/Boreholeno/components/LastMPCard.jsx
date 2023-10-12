import {Card, CardContent, CardHeader} from '@mui/material';
import React from 'react';

const LastMPCard = ({title, children}) => {
  return (
    <Card
      sx={{
        // textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        borderRadius: 2,
        border: 2,
        borderColor: 'secondary.main',
        backgroundColor: 'primary.light',
        color: 'primary.contrastText',
        width: 300,
      }}
    >
      <CardHeader title={title} sx={{}} />
      <CardContent
        sx={{
          p: 1,
          m: 0,
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
};

export default LastMPCard;
