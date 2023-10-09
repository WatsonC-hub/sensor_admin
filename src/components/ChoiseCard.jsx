import {Card, CardContent, CardHeader, Typography} from '@mui/material';
import React from 'react';
import {useNavigate} from 'react-router-dom';

const ChoiseCard = ({navigateTo, title, text, icon: Icon, sx}) => {
  let navigate = useNavigate();
  return (
    <Card
      sx={{
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        borderRadius: 2,
        boxShadow: 8,
        backgroundColor: 'primary.light',
        color: 'primary.contrastText',
        cursor: 'pointer',
        ...sx,
      }}
      onClick={() => navigate(navigateTo)}
    >
      <CardHeader title={title} />
      <Icon sx={{color: 'primary.contrastText', height: 75, width: 75}} />
      <CardContent>
        <Typography>{text}</Typography>
      </CardContent>
    </Card>
  );
};

export default ChoiseCard;
