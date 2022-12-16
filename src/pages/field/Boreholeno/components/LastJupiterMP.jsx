import React from 'react';
import {useQuery} from '@tanstack/react-query';
import moment from 'moment';
import {Box, Typography, CircularProgress, Button} from '@mui/material';
import {apiClient} from 'src/apiClient';
import LastMPCard from './LastMPCard';
import {toast} from 'react-toastify';
import {useQueryClient} from '@tanstack/react-query';

const LastJupiterMP = ({boreholeno, intakeno, lastOurMP, watlevmpMutate}) => {
  const queryClient = useQueryClient();
  const {data, isLoading, isError, isSuccess} = useQuery(
    ['last_jupiter_mp', boreholeno, intakeno],
    async () => {
      const {data} = await apiClient.get(
        `/sensor_field/borehole/last_mp/${boreholeno}/${intakeno}`
      );
      return data;
    },
    {
      enabled: boreholeno !== -1 && boreholeno !== null && intakeno !== undefined,
    }
  );

  const showQuickAdd = data
    ? lastOurMP
      ? moment(data?.startdate).isAfter(moment(lastOurMP?.startdate))
      : true
    : false;

  const handleQuickAdd = () => {
    const payload = {
      gid: -1,
      startdate: moment(data.startdate).format('YYYY-MM-DD'),
      enddate: moment('2099-01-01').format('YYYY-MM-DD'),
      elevation: data.elevation,
      mp_description: data.descriptio,
    };
    watlevmpMutate.mutate(payload, {
      onSuccess: (data) => {
        toast.success('Målepunkt gemt');
        queryClient.invalidateQueries(['watlevmp', boreholeno]);
      },
      onError: (error) => {
        toast.error('Der skete en fejl');
      },
    });
  };

  return (
    <>
      <LastMPCard title="Gældende målepunkt">
        <Typography>I app</Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            ml: 1,
          }}
        >
          {lastOurMP && <Typography>Kote: {lastOurMP.elevation + ' m'}</Typography>}
          {!lastOurMP && (
            <Typography color="secondary.light">Registreret venligst målepunkt i app</Typography>
          )}
          {lastOurMP && (
            <Typography color="grey.400" ml={1}>
              {moment(lastOurMP?.startdate).format('YYYY-MM-DD')}
            </Typography>
          )}
        </Box>
        {lastOurMP && (
          <Typography ml={1} pb={0.5}>
            Placering: {lastOurMP?.mp_description}
          </Typography>
        )}
        <Typography>Jupiter</Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          {(isLoading || isSuccess) && (
            <Typography ml={1}>
              Kote: {isLoading && <CircularProgress size={12} />}
              {isSuccess && data?.elevation + ' m'}
            </Typography>
          )}

          {isError && (
            <Typography ml={1} color="secondary.light">
              Ingen data i Jupiter
            </Typography>
          )}

          {isSuccess && (
            <Typography color="grey.400" ml={1}>
              {moment(data.startdate).format('YYYY-MM-DD')}
            </Typography>
          )}
        </Box>
        {isSuccess && <Typography ml={1}>Placering: {data?.descriptio}</Typography>}

        {showQuickAdd && (
          <Button variant="contained" color="secondary" onClick={handleQuickAdd}>
            Tilføj Jupiter målepunkt
          </Button>
        )}
      </LastMPCard>
    </>
  );
};

export default LastJupiterMP;
