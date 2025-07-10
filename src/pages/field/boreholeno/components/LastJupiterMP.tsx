import {Box, Button, CircularProgress, Typography} from '@mui/material';
import {UseMutationResult, useQuery, useQueryClient} from '@tanstack/react-query';
import dayjs, {Dayjs} from 'dayjs';
import React from 'react';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {convertDate} from '~/helpers/dateConverter';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import LastMPCard from '~/pages/field/boreholeno/components/LastMPCard';
import {useAppContext} from '~/state/contexts';
import {MaalepunktPost, MaalepunktTableData} from '~/types';

interface JupiterMPProps {
  lastOurMP: MaalepunktTableData | undefined;
  watlevmpMutate: UseMutationResult<void, Error, MaalepunktPost, unknown>;
  setAddMPOpen: (open: boolean | null) => void;
}

type LastJupiterMPData = {
  descriptio: string | undefined;
  elevation: number | null;
  startdate: Dayjs;
};

type LastJupiterMPAPI = {
  descriptio: string | undefined;
  elevation: number | null;
  startdate: string;
};

const LastJupiterMP = ({lastOurMP, watlevmpMutate, setAddMPOpen}: JupiterMPProps) => {
  const {boreholeno, intakeno} = useAppContext(['boreholeno', 'intakeno']);
  const queryClient = useQueryClient();
  const {data, isLoading, isError, isSuccess} = useQuery({
    queryKey: queryKeys.Borehole.lastMP(boreholeno, intakeno),
    queryFn: async () => {
      const {data} = await apiClient.get<LastJupiterMPAPI>(
        `/sensor_field/borehole/last_mp/${boreholeno}/${intakeno}`
      );
      return data;
    },
    select: (data) =>
      ({
        descriptio: data.descriptio,
        elevation: data.elevation,
        startdate: dayjs(data.startdate),
      }) as LastJupiterMPData,
    enabled: boreholeno !== undefined && boreholeno !== null && intakeno !== undefined,
  });

  const showQuickAdd = data
    ? lastOurMP
      ? data?.startdate.isAfter(lastOurMP?.startdate)
      : true
    : false;

  const handleQuickAdd = () => {
    if (data) {
      const payload: MaalepunktPost = {
        gid: -1,
        startdate: data.startdate,
        enddate: dayjs('2099-01-01'),
        elevation: data.elevation,
        mp_description: data.descriptio,
      };

      watlevmpMutate.mutate(payload, {
        onSuccess: () => {
          toast.success('Målepunkt gemt');
          queryClient.invalidateQueries({
            queryKey: queryKeys.Borehole.watlevmp(boreholeno),
          });
          setAddMPOpen(null);
        },
        onError: () => {
          toast.error('Der skete en fejl');
        },
      });
    }
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
              {convertDate(lastOurMP.startdate)}
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
              {data.startdate.format('L')}
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
