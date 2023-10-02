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
import {Typography} from '@mui/material';
import {toast} from 'react-toastify';
import {useQueryClient, useMutation} from '@tanstack/react-query';
import {MetadataContext} from 'src/state/contexts';
import {apiClient} from 'src/apiClient';

const ExcludeModal = ({open, onClose}) => {
  const selection = useAtomValue(qaSelection);
  const [comment, setComment] = useState('');
  const metadata = useContext(MetadataContext);
  const handleSubmit = (e) => {
    e.preventDefault();
    onAccept();
    onClose();
  };

  const minX = moment.min(selection.points.map((d) => moment(d.x))).format('YYYY-MM-DD HH:mm');
  const maxX = moment.max(selection.points.map((d) => moment(d.x))).format('YYYY-MM-DD HH:mm');
  const minY = Math.min(...selection.points.map((d) => d.y)).toFixed(4);
  const maxY = Math.max(...selection.points.map((d) => d.y)).toFixed(4);

  const queryClient = useQueryClient();

  const excludeMutation = useMutation(
    async (mutation_data) => {
      const {path, data} = mutation_data;
      const {data: res} = await apiClient.post(`/sensor_admin/qa_exclude/${path}`, data);
      return res;
    },
    {
      onError: (error) => {
        toast.error('Noget gik galt');
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['qa', metadata?.ts_id]);
        toast.success('Punkter ekskluderet');
      },
    }
  );

  const onAccept = () => {
    excludeMutation.mutate({
      path: `${metadata?.ts_id}`,
      data: {
        startdate: minX,
        enddate: maxX,
        min_value: Number(minY),
        max_value: Number(maxY),
        comment: comment,
      },
    });
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Ekskluder</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Tid:</Typography>
          <Typography gutterBottom>
            {minX} - {maxX}
          </Typography>
          <Typography variant="h6">Værdi:</Typography>
          <Typography gutterBottom>
            {minY} - {maxY}
          </Typography>
          <Typography gutterBottom>Ekskluderer {selection.points.length} punkter</Typography>
          <TextField
            label="Kommentar"
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fortryd</Button>
          <Button onClick={handleSubmit} variant="contained" color="secondary">
            Ekskluder
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ExcludeModal;
