import {Box, Button, Icon, Typography} from '@mui/material';
import type {ToastContentProps} from 'react-toastify';

import {rerunIcon} from '~/helpers/plotlyIcons';
import {useCorrectData} from '~/hooks/useCorrectData';

const RerunToast = ({closeToast, data}: Partial<ToastContentProps<{ts_id: number}>>) => {
  const ts_id = data?.ts_id;

  const {mutation: correctMutation} = useCorrectData(ts_id, 'graphData');

  return (
    <Box
      display={'flex'}
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      gap={1}
      sx={{p: 0}}
    >
      <Typography variant="body1" sx={{mb: 1}}>
        Ændringer foretaget...
      </Typography>
      <Button
        onClick={(e) => {
          correctMutation.mutate();
          if (closeToast) closeToast(e);
        }}
        size="small"
        sx={{
          color: 'grey',
          '&:hover': {
            color: 'black',
          },
        }}
        startIcon={
          <Icon>
            <svg viewBox="0 0 512 512" width="20px" height="20px">
              <path d={rerunIcon.path} fill={'grey'} stroke={'grey'} strokeWidth={'grey'} />
            </svg>
          </Icon>
        }
      >
        Genkør
      </Button>
    </Box>
  );
};

export default RerunToast;
