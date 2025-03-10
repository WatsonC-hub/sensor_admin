import {Box, MenuItem, Select, TextField, Typography} from '@mui/material';
import moment from 'moment';
import React from 'react';
import OwnDatePicker from '~/components/OwnDatePicker';

const LocationListFilter = () => {
  const [date, setDate] = React.useState<string | null>(null);
  const handleStartdateChange = (date: string) => {
    if (moment(date).isValid()) {
      setDate(date);
    }
  };
  return (
    <Box p={1} display={'flex'} flexDirection={'column'} gap={1}>
      <Typography variant={'h6'} fontWeight={'bold'}>
        Sortere efter
      </Typography>
      <Box
        display={'flex'}
        flexDirection={'row'}
        alignItems={'center'}
        justifyContent={'center'}
        gap={1}
      >
        <Select size="small" defaultValue={'Nyeste'}>
          <MenuItem value={'Nyeste'}>Nyeste</MenuItem>
        </Select>
        <OwnDatePicker
          size={'small'}
          label={'Dato'}
          value={date}
          onChange={(date: string) => handleStartdateChange(date)}
        />
        <TextField label={'Navn'} variant={'outlined'} size={'small'} />
      </Box>
    </Box>
  );
};

export default LocationListFilter;
