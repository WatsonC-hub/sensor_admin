import {useContext, useState} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import moment from 'moment';
import {useAtomValue} from 'jotai';
import {qaSelection} from 'src/state/atoms';
import {Typography, Box} from '@mui/material';
import {toast} from 'react-toastify';
import {useQueryClient, useMutation} from '@tanstack/react-query';
import {MetadataContext} from 'src/state/contexts';
import {apiClient} from 'src/apiClient';

const YRangeModal = ({open, onClose}) => {
  const selection = useAtomValue(qaSelection);
  const [minY, setMinY] = useState(selection?.selections?.[0]?.y1?.toFixed(2));
  const [maxY, setMaxY] = useState(selection?.selections?.[0]?.y0?.toFixed(2));
  const metadata = useContext(MetadataContext);
  const handleSubmit = (e) => {
    e.preventDefault();
    onAccept();
    onClose();
  };

  //   const minY = selection.selections[0].y1.toFixed(2);
  //   const maxY = selection.selections[0].y0.toFixed(2);

  const queryClient = useQueryClient();

  const yRangeMutation = useMutation(
    async (data) => {
      const {data: res} = await apiClient.post(`/sensor_admin/qa_yrange/${metadata?.ts_id}`, data);
      return res;
    },
    {
      onError: (error) => {
        toast.error('Noget gik galt');
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['qa', metadata?.ts_id]);
        toast.success('Valide værdier er gemt');
      },
    }
  );

  const onAccept = () => {
    yRangeMutation.mutate({
      minvalue: Number(minY),
      maxvalue: Number(maxY),
    });
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Valide værdier</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Område: {metadata?.unit}</Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'left',
            }}
          >
            <TextField
              label="Minimum"
              variant="outlined"
              value={minY}
              size="small"
              type="number"
              onChange={(e) => setMinY(e.target.value)}
              sx={{maxWidth: '120px'}}
            />
            <Typography gutterBottom> - </Typography>
            <TextField
              label="Maximum"
              variant="outlined"
              value={maxY}
              size="small"
              type="number"
              onChange={(e) => setMaxY(e.target.value)}
              sx={{maxWidth: '120px'}}
            />
          </Box>
          <Typography gutterBottom>
            <b>Obs:</b> Denne ændring vil gøre at alle punkter udenfor disse værdier vil blive
            fjernet automatisk
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fortryd</Button>
          <Button onClick={handleSubmit} variant="contained" color="secondary">
            Bekræft
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default YRangeModal;