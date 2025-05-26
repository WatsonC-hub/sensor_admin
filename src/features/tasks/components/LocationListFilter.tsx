import {Box, Typography} from '@mui/material';
import {useAtom} from 'jotai';
import React from 'react';
import ExtendedAutocomplete from '~/components/Autocomplete';
import {assignedToAtom} from '~/state/atoms';
import {useTasks} from '../api/useTasks';
import {TaskUser} from '../types';

// const LocationSortingList = {
//   Newest: 'Nyeste',
//   Oldest: 'Ældste',
// };

const LocationListFilter = () => {
  // const [sortingAtom, setSortingAtom] = useAtom(locationListSortingAtom);
  const [selectedUser, setSelectedUser] = useAtom<TaskUser | null>(assignedToAtom);

  const {
    getUsers: {data: taskUsers},
  } = useTasks();

  const expandedUserList = [
    ...(taskUsers !== undefined ? taskUsers : []),
    {id: 'ikke tildelt', display_name: 'Ikke tildelt'},
  ];

  return (
    <Box p={1} display={'flex'} flexDirection={'column'} gap={1}>
      <Typography variant={'h6'} fontWeight={'bold'}>
        Filtrering
      </Typography>
      <Box
        display={'flex'}
        flexDirection={'row'}
        alignItems={'center'}
        justifyContent={'space-between'}
        gap={1}
      >
        {/* <Select
          size="small"
          defaultValue={sortingAtom}
          value={sortingAtom}
          onChange={(e) => {
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
        </Select> */}

        <ExtendedAutocomplete<TaskUser>
          labelKey="display_name"
          options={expandedUserList ?? []}
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
