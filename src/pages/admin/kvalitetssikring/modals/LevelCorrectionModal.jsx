import {Typography} from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import {useAtomValue} from 'jotai';
import moment from 'moment';
import {useContext, useState} from 'react';

import {useLevelCorrection} from '~/hooks/query/useLevelCorrection';
import {qaSelection} from '~/state/atoms';
import {MetadataContext} from '~/state/contexts';

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
  const x = moment(selection?.points?.[0]?.x);

  const {post: levelCorrectionMutation} = useLevelCorrection();

  const onAccept = () => {
    levelCorrectionMutation.mutate({
      path: `${metadata?.ts_id}`,
      data: {date: x.toISOString(), comment: comment},
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
            <b>Tid:</b> {x.format('YYYY-MM-DD HH:mm')}
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
