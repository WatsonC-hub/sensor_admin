import React, {useState, useEffect} from 'react';

import {
  TextField,
  Button,
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';

const OptionsForm = ({name, options}) => {
  return (
    <Card
      sx={{
        justifyContent: 'center',
        alignContent: 'center',
        borderRadius: 2,
        border: 2,
        borderColor: 'secondary.main',
        width: 300,
      }}
    >
      <CardHeader title={name} sx={{}} />
      <CardContent
        sx={{
          p: 1,
          m: 0,
        }}
      >
        {options.map((option) => {
          return (
            <TextField
              fullWidth
              type={option.type}
              label={option.name}
              InputProps={{
                inputProps: {
                  max: option.max,
                  min: option.min,
                },
                endAdornment: option.unit,
              }}
            />
          );
        })}
      </CardContent>
    </Card>
  );
};

export default OptionsForm;
