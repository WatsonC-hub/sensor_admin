import {Button, Icon} from '@mui/material';
import {useLocation} from 'react-router-dom';
import {useCorrectData} from 'src/hooks/useCorrectData';
import {rerunIcon} from './plotlyIcons';

const CloseButton = ({closeToast}) => {
  const location = useLocation();
  const split = location.pathname.split('/');
  const ts_id = split[split.length - 1];

  const {mutation: correctMutation} = useCorrectData(ts_id, 'graphData');

  return (
    <Button
      onClick={() => {
        correctMutation.mutate({});
        closeToast();
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
  );
};

export default CloseButton;
