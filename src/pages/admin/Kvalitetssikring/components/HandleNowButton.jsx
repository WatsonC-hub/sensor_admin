import {Button} from '@mui/material';
import {useMutation} from '@tanstack/react-query';
import React, {useContext} from 'react';
import {toast} from 'react-toastify';
import {apiClient} from 'src/apiClient';
import {MetadataContext} from 'src/state/contexts';

const HandleNowButton = () => {
  const metadata = useContext(MetadataContext);

  const handledMutation = useMutation(async (data) => {
    const {data: res} = await apiClient.post(`/sensor_admin/qa_handled/${metadata?.ts_id}`);
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
