import {Box, MenuItem, Select, Typography} from '@mui/material';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {useAtom} from 'jotai';
import moment, {Moment} from 'moment';
import React from 'react';
import ExtendedAutocomplete from '~/components/Autocomplete';
import {locationListSortingAtom} from '~/state/atoms';

const LocationSortingList = {
  Newest: 'Nyeste',
  Oldest: 'Ældste',
};

const LocationListFilter = () => {
  const [sortingAtom, setSortingAtom] = useAtom(locationListSortingAtom);
  const [date, setDate] = React.useState<Moment | null>(null);
  const handleStartdateChange = (date: Moment | null) => {
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
        justifyContent={'space-between'}
        gap={1}
      >
        <Select
          size="small"
          defaultValue={sortingAtom}
          value={sortingAtom}
          onChange={(e) => {
            console.log(e.target.value);
            setSortingAtom(e.target.value);
          }}
          sx={{
            fontSize: 'small',
            '& .MuiOutlinedInput-input ': {
              py: 0.5,
              px: 1,
            },
          }}
        >
          {Object.entries(LocationSortingList).map(([key, value]) => {
            console.log(key, value);
            return (
              <MenuItem key={key} value={key}>
                {value}
              </MenuItem>
            );
          })}
        </Select>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={date ?? null}
            onChange={(date) => handleStartdateChange(date)}
            slotProps={{
              inputAdornment: {
                sx: {
                  fontSize: 'small',
                  py: 0,
                },
              },
              textField: {
                placeholder: 'Dato',
                size: 'small',
                sx: {
                  width: 285,
                  borderRadius: 2.5,
                  '& .MuiSvgIcon-root': {
                    fontSize: 'medium',
                  },
                  '& .MuiOutlinedInput-input': {
                    py: 0.5,
                    px: 1,
                    fontSize: 'small',
                  },
                },
              },
            }}
            sx={{
              margin: 'none',
            }}
          />
        </LocalizationProvider>

        <ExtendedAutocomplete
          labelKey={'name'}
          options={[]}
          fullWidth={false}
          selectValue={null}
          onChange={() => {}}
          slotProps={{
            popupIndicator: {
              sx: {
                py: 0,
              },
            },
            clearIndicator: {
              sx: {
                py: 0,
              },
            },
          }}
          textFieldsProps={{
            placeholder: 'Ansvarlig',
            label: '',
            sx: {
              fontSize: 'small',
              margin: 0,
              width: 'fit-content',
              minWidth: 150,
              '& .MuiOutlinedInput-root, .MuiAutocomplete-popupIndicator, .MuiAutocomplete-clearIndicator':
                {
                  fontSize: 'small',
                  border: 'none',
                  borderColor: 'grey.400',
                  '& > fieldset': {
                    color: 'grey.400',
                    borderColor: 'grey.400',
                  },
                  '& .MuiOutlinedInput-input': {
                    py: 0.5,
                    px: 1,
                  },
                  padding: '0px !important',
                },
            },
          }}
        ></ExtendedAutocomplete>
      </Box>
    </Box>
  );
};

export default LocationListFilter;
