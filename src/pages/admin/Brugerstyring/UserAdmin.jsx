import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';

const UserAdmin = () => {
  const {data, isLoading, error} = useQuery(['borehole_permission'], async ({signal}) => {
    const {data} = await apiClient.get(`/sensor_admin/user/borehole`, {
      signal,
    });
    return data;
  });

  console.log(data);

  return <div>{JSON.stringify(data)}</div>;
};

export default UserAdmin;
