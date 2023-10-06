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
import {FormControl, FormControlLabel, Radio, RadioGroup, Typography} from '@mui/material';
import {toast} from 'react-toastify';
import {useQueryClient, useMutation} from '@tanstack/react-query';
import {MetadataContext} from 'src/state/contexts';
import {apiClient} from 'src/apiClient';
import {useExclude} from 'src/hooks/query/useExclude';

const ExcludeModal = ({open, onClose}) => {
  const [radio, setRadio] = useState('selected');
  const selection = useAtomValue(qaSelection);
  const [comment, setComment] = useState('');
  const metadata = useContext(MetadataContext);
  const handleSubmit = (e) => {
    e.preventDefault();
    onAccept();
    onClose();
  };

  const minX = moment(selection?.selections?.[0]?.x0).format('YYYY-MM-DD HH:mm');
  const maxX = moment(selection?.selections?.[0]?.x1).format('YYYY-MM-DD HH:mm');
  const minY = selection?.selections?.[0]?.y1?.toFixed(4);
  const maxY = selection?.selections?.[0]?.y0?.toFixed(4);
  const queryClient = useQueryClient();

  const {post: excludeMutation} = useExclude();

  const onAccept = () => {
    excludeMutation.mutate({
      path: `${metadata?.ts_id}`,
      data: {
        startdate: minX,
        enddate: maxX,
        min_value: radio == 'selected' ? Number(minY) : null,
        max_value: radio == 'selected' ? Number(maxY) : null,
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

          <TextField
            label="Kommentar"
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
          <Typography gutterBottom>
            Vil du fjerne alt inden for de to tidsstempler, eller kun de valgte punkter?
          </Typography>
          <FormControl>
            <RadioGroup
              aria-label="exclude"
              name="exclude"
              value={radio}
              onChange={(e) => setRadio(e.target.value)}
            >
              <FormControlLabel control={<Radio />} label="Valgte punkter" value="selected" />
              <FormControlLabel
                control={<Radio />}
                label="Alt inden for tidsstempler"
                value="all"
              />
            </RadioGroup>
          </FormControl>
          {radio == 'selected' && (
            <Typography gutterBottom>Ekskluderer {selection.points.length} punkter</Typography>
          )}
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
