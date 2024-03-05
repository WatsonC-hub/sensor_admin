import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {apiClient} from 'src/apiClient';
import NavBar from 'src/components/NavBar';

const UserAdmin = () => {
  const {data, isLoading, error} = useQuery(['borehole_permission'], async ({signal}) => {
    const {data} = await apiClient.get(`/sensor_admin/user/borehole`, {
      signal,
    });
    return data;
  });

  console.log(data);

  return (
    <>
      <NavBar />
      <div>{JSON.stringify(data)}</div>
    </>
  );
};

export default UserAdmin;
