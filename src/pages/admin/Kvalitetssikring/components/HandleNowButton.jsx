import {Button} from '@mui/material';
import {useMutation} from '@tanstack/react-query';
import React from 'react';
import {toast} from 'react-toastify';
import {apiClient} from 'src/apiClient';

const HandleNowButton = () => {
  const handledMutation = useMutation(async (data) => {
    const {data: res} = await apiClient.post(`/sensor_admin/qa_handled/${stationId}`);
    return res;
  });
  return (
    <Button
      ml={1}
      color="secondary"
      variant="contained"
      onClick={async () => {
        toast.promise(() => handledMutation.mutateAsync(), {
          pending: 'Markerer som færdighåndteret',
          success: 'Færdighåndteret',
          error: 'Fejl',
        });
      }}
    >
      Færdighåndteret til nu
    </Button>
  );
};

export default HandleNowButton;
