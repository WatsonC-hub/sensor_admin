import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import {Box, Typography, useTheme} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import {useQuery} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {AppBarLayout, NavBarMenu} from 'src/NavBar';
import {apiClient} from 'src/apiClient';
import useBreakpoints from 'src/hooks/useBreakpoints';
import {authStore} from 'src/state/store';
import NotificationList from '../../../components/NotificationList';
import Boreholeno from './Boreholeno';
import MinimalSelectBorehole from './MinimalSelectBorehole';

export default function BoreholeRouter() {
  const [selectedItem, setSelectedItem] = useState(-1);
  const {isMobile} = useBreakpoints();
  const adminAccess = authStore((state) => state.adminAccess);

  const theme = useTheme();
  const params = useParams();
  const navigate = useNavigate();

  const {data: data} = useQuery(
    ['borehole', params.boreholeno],
    async () => {
      const {data} = await apiClient.get(`/sensor_field/borehole/jupiter/${params.boreholeno}`);
      return data;
    },
    {
      enabled: params.boreholeno !== undefined,
      placeholderData: [],
    }
  );

  const {data: stamdata, isLoading} = useQuery(
    ['borehole_stamdata', params.boreholeno, params.intakeno],
    async () => {
      const {data} = await apiClient.get(
        `/sensor_field/borehole/stamdata/${params.boreholeno}/${params.intakeno}`
      );
      return data;
    },
    {
      enabled: params.boreholeno !== undefined && params.intakeno !== undefined,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      retry: false,
    }
  );

  useEffect(() => {
    if (data) {
      let intakeno = params.intakeno;
      if (intakeno) {
        setSelectedItem(parseInt(intakeno));
      } else {
        intakeno = -1;
        if (data.length === 1) {
          intakeno = data[0].intakeno;
          navigate(`../borehole/${params.boreholeno}/${intakeno}`, {
            replace: true,
          });
        }
        setSelectedItem(intakeno);
      }
    }
  }, [data]);

  return (
    <>
      <CssBaseline />
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
            <Typography pl={1.7}>{params.boreholeno}</Typography>
            <MinimalSelectBorehole
              boreholeno={params.boreholeno}
              boreholenoList={data}
              selectedIntake={selectedItem}
              setSelectedItem={setSelectedItem}
            />
          </Box>
        </Box>
        {stamdata?.hasUnit && (
          <Box display="flex" justifyContent="center" alignItems="center">
            {adminAccess && <NotificationList ts_id={stamdata?.ts_id} loc_id={stamdata?.loc_id} />}
            <NavBarMenu
              highligtFirst={!isMobile}
              items={[
                ...(adminAccess
                  ? [
                      {
                        title: 'Til QA',
                        onClick: () => {
                          navigate(`/admin/kvalitetssikring/${stamdata?.ts_id}`);
                        },
                        icon: <AutoGraphIcon />,
                      },
                    ]
                  : []),
              ]}
            />
          </Box>
        )}
      </AppBarLayout>

      <main
        style={{
          flexGrow: 1,
          // padding: theme.spacing(0.5),
        }}
      >
        {!isLoading && (
          <Boreholeno
            boreholeno={params.boreholeno}
            intakeno={params.intakeno}
            stamdata={stamdata}
          />
        )}
      </main>
    </>
  );
}
