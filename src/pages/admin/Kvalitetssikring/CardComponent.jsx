import React, {useState, useEffect} from 'react';
import moment from 'moment';
import {TextField, Card, CardContent, CardHeader, Box, Typography, Button} from '@mui/material';
import OwnDatePicker from 'src/components/OwnDatePicker';

const cardStyle = {
  justifyContent: 'center',
  alignContent: 'center',
  borderRadius: 2,
  border: 2,
  borderColor: 'secondary.main',
  width: 300,
};

const OptionsForm = ({options}) => {
  <Card sx={cardStyle}>
    <CardHeader title={cardData.name} sx={{}} />
    <CardContent
      sx={{
        p: 1,
        m: 0,
      }}
    >
      <TextField
        fullWidth
        type={cardData.type}
        label={cardData.name}
        InputProps={{
          inputProps: {
            oldDate: cardData.max,
            newDate: cardData.min,
          },
        }}
      />
    </CardContent>
  </Card>;
};

export default OptionsForm;
