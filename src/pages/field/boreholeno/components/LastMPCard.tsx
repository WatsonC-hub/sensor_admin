import {Card, CardContent, CardHeader} from '@mui/material';
import React from 'react';

interface MPCardProps {
  title: string;
  children: React.ReactNode;
}

const LastMPCard = ({title, children}: MPCardProps) => {
  return (
    <Card
      sx={{
        alignSelf: 'center',
        borderRadius: 2,
        backgroundColor: 'primary.light',
        color: 'primary.contrastText',
        width: 'fit-content',
      }}
    >
      <CardHeader title={title} sx={{py: 0.5, px: 1.5}} />
      <CardContent
        sx={{
          p: 0,
          px: 1,
          m: 0,
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
};

export default LastMPCard;
