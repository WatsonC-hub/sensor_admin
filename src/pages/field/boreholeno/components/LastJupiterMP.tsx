import {Box, CircularProgress, Typography, Stack, Divider} from '@mui/material';
import {UseMutationResult, useQuery} from '@tanstack/react-query';
import dayjs, {Dayjs} from 'dayjs';
import React from 'react';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import {convertDate} from '~/helpers/dateConverter';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import LastMPCard from '~/pages/field/boreholeno/components/LastMPCard';
import {useAppContext} from '~/state/contexts';
import {MaalepunktPost, MaalepunktTableData} from '~/types';

interface JupiterMPProps {
  lastOurMP: MaalepunktTableData | undefined;
  watlevmpMutate?: UseMutationResult<void, Error, MaalepunktPost, unknown>;
  setAddMPOpen: (open: boolean | null) => void;
  ts_id?: number;
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

const LastJupiterMP = ({lastOurMP, watlevmpMutate, setAddMPOpen, ts_id}: JupiterMPProps) => {
  const {boreholeno, intakeno} = useAppContext(['boreholeno', 'intakeno']);
  const {post: addWatlevmp} = useMaalepunkt(ts_id);
  const {data, isLoading, isError, isSuccess} = useQuery({
    queryKey: queryKeys.Borehole.lastMP(boreholeno, intakeno),
    queryFn: async () => {
      const {data} = await apiClient.get<LastJupiterMPAPI>(
        `/sensor_field/borehole/last_mp/${boreholeno}/${intakeno}`
      );
      return {
        descriptio: data.descriptio,
        elevation: data.elevation,
        startdate: dayjs(data.startdate),
      } as LastJupiterMPData;
    },
    enabled: !!boreholeno && !!intakeno,
  });

  const showQuickAdd = data
    ? lastOurMP
      ? data.startdate.isAfter(lastOurMP.startdate)
      : true
    : false;

  const handleQuickAdd = () => {
    if (!data) return;

    if (!watlevmpMutate) {
      const payload = {
        path: `${ts_id}`,
        data: {
          gid: -1,
          startdate: data.startdate,
          enddate: dayjs('2099-01-01'),
          elevation: data.elevation,
          mp_description: data.descriptio ?? '',
        },
      };
      addWatlevmp.mutate(payload, {
        onSuccess: () => {
          toast.success('Målepunkt gemt');
          setAddMPOpen(null);
        },
        onError: () => toast.error('Der skete en fejl'),
      });
    } else {
      const payload: MaalepunktPost = {
        gid: -1,
        startdate: data.startdate,
        enddate: dayjs('2099-01-01'),
        elevation: data.elevation,
        mp_description: data.descriptio ?? '',
      };
      watlevmpMutate.mutate(payload, {
        onSuccess: () => {
          toast.success('Målepunkt gemt');
          setAddMPOpen(null);
        },
        onError: () => toast.error('Der skete en fejl'),
      });
    }
  };

  return (
    <LastMPCard title="">
      <Stack direction={'row'} spacing={2} justifyContent="space-between">
        <Box
          sx={{
            flex: 1,
            border: '1px solid',
            borderColor: 'white',
            borderRadius: 2,
            px: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">I app</Typography>
          </Stack>

          {lastOurMP ? (
            <>
              <Typography>Kote: {lastOurMP.elevation} m</Typography>
              <Typography variant="body2" color="white">
                {convertDate(lastOurMP.startdate)}
              </Typography>
              <Typography variant="body2">Placering: {lastOurMP.mp_description}</Typography>
            </>
          ) : (
            <Typography color="white">Ingen målepunkt registreret i appen.</Typography>
          )}
        </Box>

        <Box
          sx={{
            flex: 1,
            border: '1px solid',
            borderColor: 'white',
            borderRadius: 2,
            px: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">Jupiter</Typography>
          </Stack>

          {isLoading && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <CircularProgress size={16} />
              <Typography variant="body2">Indlæser data...</Typography>
            </Stack>
          )}

          {isError && <Typography color="white">Ingen data i Jupiter.</Typography>}

          {isSuccess && (
            <>
              <Typography>Kote: {data.elevation} m</Typography>
              <Typography variant="body2" color="white">
                {data.startdate.format('L')}
              </Typography>
              <Typography variant="body2">Placering: {data.descriptio}</Typography>
            </>
          )}
        </Box>
      </Stack>
      {showQuickAdd && (
        <>
          <Divider sx={{my: 1}} />
          <Button bttype="tertiary" onClick={handleQuickAdd}>
            Tilføj Jupiter målepunkt
          </Button>
        </>
      )}
    </LastMPCard>
  );
};

export default LastJupiterMP;
