import {Save} from '@mui/icons-material';
import {Box, CardContent, Typography} from '@mui/material';
import {useMutation} from '@tanstack/react-query';
import React, {useContext} from 'react';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import {MetadataContext} from '~/state/contexts';

interface WizardGodkendTidsserieProps {
  setStep: (value: number) => void;
}

const WizardGodkendTidsserie = ({setStep}: WizardGodkendTidsserieProps) => {
  const metadata = useContext(MetadataContext);

  const handledMutation = useMutation({
    mutationFn: async () => {
      const {data: res} = await apiClient.post(`/sensor_admin/qa_handled/${metadata?.ts_id}`);
      return res;
    },
  });
  return (
    <Box alignSelf={'center'} width={'inherit'} height={'inherit'} justifySelf={'center'}>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 'inherit',
          alignContent: 'center',
        }}
      >
        <Box display={'flex'} flexDirection="column" mb={3} justifyContent={'center'}>
          <Typography alignSelf={'center'} variant="h5" component="h2" fontWeight={'bold'}>
            Markere tidsserie som godkendt
          </Typography>
          <Typography sx={{wordWrap: 'break-word'}}>
            På denne side af guiden har du mulighed for at godkende tidsserien. Hvis du er sikker på
            at der ikke mangler ændringer eller fejlhåndtering og at tidsserien er klar til at blive
            godtkendt, så tryk på knappen nedenfor.
          </Typography>
        </Box>
        <Box
          display={'flex'}
          flexDirection={'column'}
          alignItems={'center'}
          alignSelf={'center'}
          gap={1}
        >
          {/* <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={1}>
            <Typography>Tidsinterval:</Typography>
            <TextField value={moment().format('YYYY-MM-DD HH:mm')} type="datetime-local" />
            -
            <TextField value={moment().format('YYYY-MM-DD HH:mm')} type="datetime-local" />
          </Box>
          <TextField
            label="Kommentar"
            sx={{width: 400}}
            placeholder="Kommentar"
            multiline
            rows={3}
          /> */}
          <Box display={'flex'} flexDirection={'row'} alignSelf={'center'} gap={1}>
            <Button
              bttype="tertiary"
              onClick={() => {
                setStep(0);
              }}
            >
              Annuller
            </Button>
            <Button
              bttype="primary"
              startIcon={<Save />}
              onClick={() => {
                toast.promise(() => handledMutation.mutateAsync(), {
                  pending: 'Markerer som færdighåndteret',
                  success: 'Færdighåndteret',
                  error: 'Fejl',
                });
                setStep(0);
              }}
            >
              Færdighåndteret til nu
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Box>
  );
};

export default WizardGodkendTidsserie;
