import {Box, MenuItem, Select, Typography} from '@mui/material';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {useAtom} from 'jotai';
import {Moment} from 'moment';
import React from 'react';
import ExtendedAutocomplete from '~/components/Autocomplete';
import {assignedToAtom, dueDateAtom, locationListSortingAtom} from '~/state/atoms';
import {useTasks} from '../api/useTasks';
import {TaskUser} from '../types';

const LocationSortingList = {
  Newest: 'Nyeste',
  Oldest: 'Ældste',
};

const LocationListFilter = () => {
  const [sortingAtom, setSortingAtom] = useAtom(locationListSortingAtom);
  const [selectedUser, setSelectedUser] = useAtom<TaskUser | null>(assignedToAtom);
  const [DueDate, setDueDate] = useAtom<Moment | null>(dueDateAtom);
  // const [date, setDate] = React.useState<Moment | null>(null);
  const handleStartdateChange = (date: Moment | null) => {
    setDueDate(date);
  };

  const {
    getUsers: {data: taskUsers},
  } = useTasks();

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
            return (
              <MenuItem key={key} value={key}>
                {value}
              </MenuItem>
            );
          })}
        </Select>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={DueDate}
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

        <ExtendedAutocomplete<TaskUser>
          labelKey="display_name"
          options={taskUsers ?? []}
          getOptionLabel={(option) => option.display_name}
          getOptionKey={(option) => option.id}
          fullWidth={false}
          size="small"
          selectValue={selectedUser}
          clearOnBlur={false}
          onChange={(e) => {
            if (e && 'id' in e) setSelectedUser(e);
            else setSelectedUser(null);
          }}
          renderOption={(props, option) => {
            return (
              <li {...props} key={option.id}>
                <Box display={'flex'} flexDirection={'row'}>
                  <Typography variant="body2">{option.display_name}</Typography>
                </Box>
              </li>
            );
          }}
          textFieldsProps={{
            placeholder: 'Ansvarlig',
            label: '',
            sx: {
              margin: 0,
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                fontSize: 'small',
                border: 'none',
                borderColor: 'grey.400',
                padding: '1.5px !important',
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default LocationListFilter;
