import {useQuery} from '@tanstack/react-query';
import React from 'react';

import {apiClient} from '~/apiClient';
import NavBar from '~/components/NavBar';

const UserAdmin = () => {
  const {data} = useQuery({
    queryKey: ['borehole_permission'],
    queryFn: async ({signal}) => {
      const {data} = await apiClient.get(`/sensor_admin/user/borehole`, {
        signal,
      });
      return data;
    },
  });

  return (
    <>
      <NavBar />
      <div>{JSON.stringify(data)}</div>
    </>
  );
};

export default UserAdmin;
