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

const LevelCorrectionModal = ({open, onClose}) => {
  const selection = useAtomValue(qaSelection);
  const [comment, setComment] = useState('');
  const metadata = useContext(MetadataContext);
  const handleSubmit = (e) => {
    e.preventDefault();
    onAccept();
    onClose();
  };

  const y = selection?.points?.[0]?.y?.toFixed(4);
  const x = moment(selection?.points?.[0]?.x).format('YYYY-MM-DD HH:mm');

  const queryClient = useQueryClient();

  const levelCorrectionMutation = useMutation(
    async (mutation_data) => {
      const {path, data} = mutation_data;
      const {data: res} = await apiClient.post(`/sensor_admin/qa_levelcorrection/${path}`, data);
      return res;
    },
    {
      onError: (error) => {
        toast.error('Noget gik galt');
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['qa', metadata?.ts_id]);
        toast.success('Data er gemt');
      },
    }
  );

  const onAccept = () => {
    levelCorrectionMutation.mutate({
      path: `${metadata?.ts_id}`,
      data: {date: x, comment: comment},
    });
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Niveau korrektion</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Korrigerer grafen fremadrettet ved at sætte det følgende punkt lig med det forrige punkt
          </Typography>
          <Typography gutterBottom>
            <b>Tid:</b> {x}
          </Typography>
          <Typography gutterBottom>
            <b>Værdi:</b> {y} {metadata?.unit}
          </Typography>

          <TextField
            label="Kommentar"
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            multiline
            fullWidth
            rows={3}
          />
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

export default LevelCorrectionModal;
