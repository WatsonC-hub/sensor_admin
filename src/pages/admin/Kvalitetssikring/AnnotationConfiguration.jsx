import React from 'react';
import {Card, CardHeader, CardContent, TextField, CardActions, Button} from '@mui/material';
import { useQuery } from '@tanstack/react-query';

const AnnotationConfiguration = () => {
  return (
    <Card
      sx={{
        // textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        borderRadius: 2,
        border: 2,
        borderColor: 'secondary.main',
        // backgroundColor: 'primary.light',
        // color: 'primary.contrastText',
        // width: 300,
        m: 1,
      }}
    >
      <CardHeader title={'Annotering'} sx={{}} />
      <CardContent
        sx={{
          p: 1,
          m: 0,
        }}
      >
        Hejsa
      </CardContent>
    </Card>
  );
};

export default AnnotationConfiguration;
