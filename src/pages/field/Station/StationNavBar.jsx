import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import {Box, IconButton, Typography} from '@mui/material';
import React from 'react';
import {useNavigate} from 'react-router-dom';
import {AppBarLayout, NavBarMenu} from 'src/NavBar';
import useBreakpoints from 'src/hooks/useBreakpoints';
import {authStore} from 'src/state/store';
import NotificationList from '../../../components/NotificationList';
import MinimalSelect from './MinimalSelect';

const StationNavBar = ({loc_id, ts_id, loc_name, select_list}) => {
  const navigate = useNavigate();
  const {isMobile} = useBreakpoints();
  const adminAccess = authStore((state) => state.adminAccess);

  return (
    <AppBarLayout>
      <Box display="flex">
        <IconButton
          color="inherit"
          onClick={(e) => {
            navigate(-1);
          }}
          size="large"
        >
          <KeyboardBackspaceIcon />
        </IconButton>
        <Box>
          <Typography pl={1.7}>{loc_name}</Typography>
          <MinimalSelect locid={loc_id} stationList={select_list} />
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center">
        {adminAccess && <NotificationList ts_id={ts_id} loc_id={loc_id} />}
        <NavBarMenu
          highligtFirst={!isMobile}
          items={[
            ...(adminAccess
              ? [
                  {
                    title: 'Til QA',
                    onClick: () => {
                      navigate(`/admin/kvalitetssikring/${ts_id}`);
                    },
                    icon: <AutoGraphIcon />,
                  },
                ]
              : []),
          ]}
        />
      </Box>
    </AppBarLayout>
  );
};

export default StationNavBar;
