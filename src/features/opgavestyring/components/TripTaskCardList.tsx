import {Person} from '@mui/icons-material';
import {Box, Typography} from '@mui/material';
import React from 'react';
import {Task} from '~/features/tasks/types';
import {LocationTasks, TaskCollection} from '~/types';

type TripTaskCardListProps = {
  data: TaskCollection | undefined;
};

const TripTaskCardList = ({data}: TripTaskCardListProps) => {
  console.log(data);

  const grouped_data = data?.tasks?.reduce(
    (
      acc: Record<
        string,
        {Tasks: Array<LocationTasks>; contactMobile: string; loc_name: string | undefined}
      >,
      task
    ) => {
      if (acc[task.loc_id] === undefined) {
        acc[task.loc_id] = {
          Tasks: data.tasks.filter((loc) => loc.loc_id === task.loc_id),
          contactMobile: data.contacts.find((contact) => contact.loc_id === task.loc_id)
            ?.telefonnummer,
          loc_name: data.tasks.find((loc) => loc.loc_id === task.loc_id)?.ts_name.split(' - ')[0],
        };
      }
      return acc;
    },
    {}
  );
  return (
    grouped_data && (
      <Box>
        {Object.keys(grouped_data).map((loc_id) => {
          return (
            <Box key={loc_id}>
              <Box>{grouped_data[loc_id].loc_name}</Box>
              <Box>{grouped_data[loc_id].contactMobile}</Box>
              <Typography>
                <Person />
                {grouped_data[loc_id].Tasks.length === 1 ? 'Opgave' : 'Opgaver'}
              </Typography>
            </Box>
          );
        })}
      </Box>
    )
  );
};

export default TripTaskCardList;
